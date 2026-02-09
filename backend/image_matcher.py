
import os
import cv2
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
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
# LOAD AI MODEL
# ============================
model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

classifier_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=True
)

# ============================
# FEATURE EXTRACTION
# ============================
def preprocess_image(img):
    img = cv2.resize(img, (224, 224))
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    return img

def extract_features_from_img(img):
    processed = preprocess_image(img)
    features = model.predict(processed, verbose=0)
    return features[0]

# ============================
# OBJECT DETECTION (ImageNet Class Prediction)
# ============================
def detect_object_label(img):
    processed = preprocess_image(img)
    preds = classifier_model.predict(processed, verbose=0)
    decoded = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=1)
    label = decoded[0][0][1]
    confidence = float(decoded[0][0][2])
    return label, confidence

# ============================
# COSINE SIMILARITY
# ============================
def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ============================
# DATABASE FUNCTIONS
# ============================
def load_db():
    if not os.path.exists(FEATURE_DB):
        return []
    with open(FEATURE_DB, "r") as f:
        return json.load(f)

def save_db(data):
    with open(FEATURE_DB, "w") as f:
        json.dump(data, f)

def store_item(feature, label, filename):
    db = load_db()
    db.append({
        "feature": feature.tolist(),
        "label": label,
        "file": filename
    })
    save_db(db)

def find_matches(feature):
    db = load_db()
    results = []

    for item in db:
        stored_feature = np.array(item["feature"])
        sim = cosine_similarity(feature, stored_feature)

        results.append({
            "file": item["file"],
            "label": item["label"],
            "similarity": sim,
            "confidence_percent": round(sim * 100, 2)
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:5]

# ============================
# API ROUTES
# ============================

# Upload and store item in database
@app.route("/upload", methods=["POST"])
def upload_item():
    file = request.files["image"]

    path = os.path.join(DB_FOLDER, file.filename)
    file.save(path)

    img = cv2.imread(path)

    label, label_conf = detect_object_label(img)
    feature = extract_features_from_img(img)

    store_item(feature, label, file.filename)

    return jsonify({
        "message": "Stored in database",
        "detected_object": label,
        "detection_confidence": round(label_conf * 100, 2)
    })

# Upload new image and match with database
@app.route("/match", methods=["POST"])
def match_item():
    file = request.files["image"]

    temp_path = "temp_query.jpg"
    file.save(temp_path)

    img = cv2.imread(temp_path)

    label, label_conf = detect_object_label(img)
    feature = extract_features_from_img(img)

    matches = find_matches(feature)

    return jsonify({
        "detected_object": label,
        "detection_confidence": round(label_conf * 100, 2),
        "matches": matches
    })

# ============================
# RUN
# ============================
if __name__ == "__main__":
    app.run(debug=True)
