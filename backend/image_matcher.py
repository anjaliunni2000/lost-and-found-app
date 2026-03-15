import os
import cv2
import json
import numpy as np
import tensorflow as tf
import faiss

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ============================
# CONFIG
# ============================

DB_FOLDER = "database"
FEATURE_DB = os.path.join(DB_FOLDER, "features.json")

os.makedirs(DB_FOLDER, exist_ok=True)

# ============================
# LOAD AI MODELS
# ============================

feature_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

label_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=True
)

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions


# ============================
# LABEL NORMALIZATION
# ============================

def normalize_label(label):

    label = label.lower()

    if "watch" in label or "clock" in label:
        return "watch"

    if "ring" in label:
        return "ring"

    if "wallet" in label or "purse" in label:
        return "wallet"

    if "bag" in label or "handbag" in label:
        return "bag"

    if "shoe" in label or "sandal" in label:
        return "shoe"

    return label


# ============================
# LABEL DETECTION
# ============================

def detect_object_label(img):

    try:

        img = cv2.resize(img, (224,224))
        img = img.astype("float32")

        img = np.expand_dims(img, axis=0)
        img = preprocess_input(img)

        preds = label_model.predict(img, verbose=0)

        decoded = decode_predictions(preds, top=1)[0][0]

        label = decoded[1]
        confidence = float(decoded[2])

        label = normalize_label(label)

        return label, confidence

    except Exception as e:

        print("Label detection error:", e)
        return "unknown",0


# ============================
# FEATURE EXTRACTION
# ============================

def preprocess_image(img):

    img = cv2.resize(img,(224,224))
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    return img


def extract_features_from_img(img):

    processed = preprocess_image(img)

    features = feature_model.predict(processed, verbose=0)[0]

    norm = np.linalg.norm(features)

    if norm > 0:
        features = features / norm

    return features


# ============================
# SIMILARITY
# ============================

def cosine_similarity(a,b):

    denom = (np.linalg.norm(a)*np.linalg.norm(b))

    if denom == 0:
        return 0

    return float(np.dot(a,b)/denom)


# ============================
# DATABASE FUNCTIONS
# ============================

def load_db():

    if not os.path.exists(FEATURE_DB):
        return []

    try:

        with open(FEATURE_DB,"r") as f:
            return json.load(f)

    except:
        return []


def save_db(data):

    with open(FEATURE_DB,"w") as f:
        json.dump(data,f)


def store_item(feature, filename, label, user_id=None, item_id=None, status=None):

    db = load_db()

    db.append({
        "feature":feature.tolist(),
        "file":filename,
        "label":label,
        "userId":user_id,
        "itemId":item_id,
        "status":status
    })

    save_db(db)


# ============================
# BUILD FAISS INDEX
# ============================

def build_faiss_index():

    db = load_db()

    vectors = []

    for item in db:
        vectors.append(item["feature"])

    if len(vectors) == 0:
        return None, []

    vectors = np.array(vectors).astype("float32")

    dimension = vectors.shape[1]

    index = faiss.IndexFlatIP(dimension)

    index.add(vectors)

    return index, db


# ============================
# FAST MATCHING USING FAISS
# ============================

def find_matches_faiss(query_vector, query_status, query_label):

    index, db = build_faiss_index()

    if index is None:
        return []

    query_vector = np.array([query_vector]).astype("float32")

    k = 10

    distances, indices = index.search(query_vector, k)

    results = []

    for i, idx in enumerate(indices[0]):

        if idx < len(db):

            item = db[idx]

            # category filter
            if item.get("label") != query_label:
                continue

            # lost ↔ found filter
            if item.get("status") == query_status:
                continue

            results.append({

                "file": item.get("file"),
                "confidence_percent": round(distances[0][i]*100,2),
                "itemId": item.get("itemId"),
                "userId": item.get("userId")

            })

    return results[:3]


# ============================
# UPLOAD ROUTE
# ============================

@app.route("/upload", methods=["POST"])
def upload_item():

    file = request.files["image"]

    user_id = request.form.get("userId")
    item_id = request.form.get("itemId")
    status = request.form.get("status")

    path = os.path.join(DB_FOLDER,file.filename)

    file.save(path)

    img = cv2.imread(path)

    if img is None:
        return jsonify({"error":"Invalid image"}),400

    label,conf = detect_object_label(img)

    feature = extract_features_from_img(img)

    store_item(
        feature,
        file.filename,
        label,
        user_id=user_id,
        item_id=item_id,
        status=status
    )

    print("Stored:",file.filename)

    return jsonify({"message":"Stored in AI database"})


# ============================
# MATCH ROUTE (FAISS VERSION)
# ============================

@app.route("/match", methods=["POST"])
def match_item():

    file = request.files["image"]

    query_status = request.form.get("status","lost")

    temp_path = "temp_query.jpg"

    file.save(temp_path)

    img = cv2.imread(temp_path)

    if img is None:
        return jsonify({"error":"Invalid image"}),400

    label,label_conf = detect_object_label(img)

    feature = extract_features_from_img(img)

    matches = find_matches_faiss(feature,query_status,label)

    print("Matches:",matches)

    return jsonify({

        "detected_object":label,
        "detection_confidence":round(label_conf*100,2),
        "matches":matches

    })


# ============================
# SERVE DATABASE IMAGES
# ============================

@app.route("/database/<filename>")
def serve_image(filename):

    return send_from_directory(DB_FOLDER,filename)


# ============================
# AUTO INDEX EXISTING IMAGES
# ============================

def auto_index_images():

    print("Checking existing images...")

    db = load_db()

    if len(db) > 0:
        print("Database already indexed")
        return

    for file in os.listdir(DB_FOLDER):

        if file.lower().endswith((".jpg",".png",".webp")):

            path = os.path.join(DB_FOLDER,file)

            img = cv2.imread(path)

            if img is None:
                continue

            label,conf = detect_object_label(img)

            feature = extract_features_from_img(img)

            store_item(
                feature,
                file,
                label,
                user_id="auto_user",
                item_id="auto_item",
                status="found"
            )

            print("Indexed:",file)

    print("Indexing finished")


# ============================
# RUN SERVER
# ============================

if __name__ == "__main__":
    app.run(port=5000,debug=True)