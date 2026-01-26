
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify

app = Flask(__name__)

model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

def extract_features(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (224, 224))
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    features = model.predict(img)
    return features[0]

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

@app.route("/match", methods=["POST"])
def match_images():
    lost = request.files["lost"]
    found = request.files["found"]

    lost_path = "lost.jpg"
    found_path = "found.jpg"

    lost.save(lost_path)
    found.save(found_path)

    f1 = extract_features(lost_path)
    f2 = extract_features(found_path)

    similarity = cosine_similarity(f1, f2)

    return jsonify({
        "similarity": float(similarity),
        "confidence": round(similarity * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)
