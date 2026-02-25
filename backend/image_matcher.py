import os
import cv2
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from email_sender import send_match_email

# ============================
# FLASK INIT
# ============================
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

# Model 1 → Feature Extraction
feature_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

# Model 2 → Label Detection
label_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=True
)

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions


# ============================
# LABEL DETECTION
# ============================
def detect_object_label(img):
    try:
        img = cv2.resize(img, (224, 224))
        img = img.astype("float32")
        img = np.expand_dims(img, axis=0)
        img = preprocess_input(img)

        preds = label_model.predict(img, verbose=0)
        decoded = decode_predictions(preds, top=1)[0][0]

        return decoded[1], float(decoded[2])

    except Exception as e:
        print("Label detection error:", e)
        return "unknown", 0.0


# ============================
# FEATURE EXTRACTION
# ============================
def preprocess_image(img):
    img = cv2.resize(img, (224, 224))
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    return img


def extract_features_from_img(img):
    processed = preprocess_image(img)
    features = feature_model.predict(processed, verbose=0)
    features = features[0]

    # Normalize feature vector (IMPORTANT FIX)
    norm = np.linalg.norm(features)
    if norm > 0:
        features = features / norm

    return features


# ============================
# SIMILARITY
# ============================
def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# ============================
# DATABASE
# ============================
def load_db():
    if not os.path.exists(FEATURE_DB):
        return []

    try:
        with open(FEATURE_DB, "r") as f:
            return json.load(f)
    except:
        return []


def save_db(data):
    with open(FEATURE_DB, "w") as f:
        json.dump(data, f)


def store_item(feature, filename, user_id=None, item_id=None, status=None):
    db = load_db()

    db.append({
        "feature": feature.tolist(),
        "file": filename,
        "userId": user_id,
        "itemId": item_id,
        "status": status
    })

    save_db(db)


# ============================
# MATCHING
# ============================
def find_matches(feature, query_status):

    db = load_db()
    results = []

    print("Database size:", len(db))

    for item in db:

        # Match only opposite status (lost ↔ found)
        if item.get("status") == query_status:
            continue

        try:
            stored_feature = np.array(item["feature"])
            sim = cosine_similarity(feature, stored_feature)

            print("Similarity with", item.get("file"), ":", sim)

            # Slightly lowered threshold for better matching
            if sim > 0.65:
                results.append({
                    "file": item.get("file"),
                    "confidence_percent": round(sim * 100, 2),
                    "ownerId": item.get("userId"),
                    "itemId": item.get("itemId")
                })

        except Exception as e:
            print("Matching error:", e)
            continue

    results.sort(key=lambda x: x["confidence_percent"], reverse=True)
    return results[:3]


# ============================
# ROUTES
# ============================

@app.route("/upload", methods=["POST"])
def upload_item():

    file = request.files["image"]
    user_id = request.form.get("userId")
    item_id = request.form.get("itemId")
    status = request.form.get("status")

    path = os.path.join(DB_FOLDER, file.filename)
    file.save(path)

    img = cv2.imread(path)
    feature = extract_features_from_img(img)

    store_item(
        feature,
        file.filename,
        user_id=user_id,
        item_id=item_id,
        status=status
    )

    return jsonify({"message": "Stored in database"})


@app.route("/match", methods=["POST"])
def match_item():

    file = request.files["image"]
    query_status = request.form.get("status", "lost")

    temp_path = "temp_query.jpg"
    file.save(temp_path)

    img = cv2.imread(temp_path)

    label, label_conf = detect_object_label(img)
    feature = extract_features_from_img(img)

    matches = find_matches(feature, query_status)

    if len(matches) > 0:
        best_match = matches[0]

        if best_match["confidence_percent"] > 85:
            try:
                send_match_email(
                    "anjaliunnikrishnan001@gmail.com",
                    label,
                    "Lost & Found System"
                )
                print("Email Triggered")
            except Exception as e:
                print("Email Error:", e)

    return jsonify({
        "detected_object": label,
        "detection_confidence": round(label_conf * 100, 2),
        "matches": matches
    })


@app.route("/database/<filename>")
def serve_image(filename):
    return send_from_directory(DB_FOLDER, filename)


# ============================
# AUTO INDEX EXISTING IMAGES
# ============================
def auto_index_images():
    print("Checking existing images for indexing...")

    db = load_db()
    if len(db) > 0:
        print("Database already contains items. Skipping auto-index.")
        return

    for file in os.listdir(DB_FOLDER):
        if file.lower().endswith((".jpg", ".png", ".webp")):

            path = os.path.join(DB_FOLDER, file)
            img = cv2.imread(path)

            if img is None:
                continue

            feature = extract_features_from_img(img)

            store_item(
                feature,
                file,
                user_id="auto_user",
                item_id="auto_item",
                status="found"
            )

            print("Indexed:", file)

    print("Auto indexing complete.")


# ============================
# RUN SERVER
# ============================
if __name__ == "__main__":
    auto_index_images()
    app.run(debug=True)