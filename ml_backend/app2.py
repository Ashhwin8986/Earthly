from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import tensorflow as tf
import os

app = Flask(__name__)
CORS(app)

# =========================
# Load SAME trained model
# =========================
MODEL_PATH = "plant_disease_detection_model.h5"



model = load_model(
    "plant_disease_detection_model.h5",
    compile=False,
    custom_objects={
        "InputLayer": tf.keras.layers.InputLayer
    }
)
model.summary()

# =========================
# SAME CLASS ORDER AS TRAINING
# =========================
CLASS_NAMES = [
    'Bacterial_spot',
    'Black_Measles',
    'Black_rot',
    'Citrus_greening',
    'Common_rust',
    'Early_blight',
    'Gray_leaf_spot',
    'Isariopsis_Leaf_Spot',
    'Late_blight',
    'Leaf_Mold',
    'Leaf_scorch',
    'Northern_Leaf_Blight',
    'Powdery_mildew',
    'Septoria_leaf_spot',
    'Spider_mites',
    'Target_Spot',
    'Yellow_Leaf_Curl_Virus',
    'apple_rust',
    'apple_scab',
    'healthy',
    'mosaic_virus'
]

IMAGE_SIZE = (224, 224)

# =========================
# Preprocessing (MATCH TRAINING)
# =========================
def preprocess_img(path):
    img = load_img(path, target_size=IMAGE_SIZE)
    arr = img_to_array(img)

    # IMPORTANT: NO NORMALIZATION
    arr = np.expand_dims(arr, axis=0)

    return arr


@app.route("/analyze-plant", methods=["POST"])
def analyze_plant():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    temp_path = "temp.jpg"
    image.save(temp_path)

    try:
        # =========================
        # Prediction
        # =========================
        x = preprocess_img(temp_path)

        preds = model.predict(x)
        probs = tf.nn.softmax(preds[0]).numpy()

        class_index = int(np.argmax(probs))
        confidence = float(probs[class_index]) * 100
        predicted_class = CLASS_NAMES[class_index]

        # =========================
        # Top 3 predictions (OPTIONAL but useful)
        # =========================
        top_idx = probs.argsort()[-3:][::-1]
        top_predictions = [
            {
                "class": CLASS_NAMES[i],
                "confidence": round(float(probs[i]) * 100, 2)
            }
            for i in top_idx
        ]

        # =========================
        # Health score logic
        # =========================
        if predicted_class == "healthy":
            health_score = min(95, int(confidence))
        else:
            health_score = max(30, int(100 - confidence))

        # =========================
        # Issues
        # =========================
        issues = []
        if predicted_class != "healthy":
            issues.append({
                "name": predicted_class,
                "severity": "High" if confidence > 80 else "Medium",
                "description": "Detected using CNN model"
            })

        # =========================
        # Response
        # =========================
        response = {
            "plantType": "Detected Plant",
            "healthScore": health_score,
            "issues": issues,
            "confidence": round(confidence, 2),
            "prediction": predicted_class,
            "topPredictions": top_predictions
        }

        return jsonify(response)

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(port=5001, debug=True)