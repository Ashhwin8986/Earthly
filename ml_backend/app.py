from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os

app = Flask(__name__)
CORS(app)

# Load model once
model = load_model("SoilNet.h5")

# IMPORTANT: class mapping (adjust order if needed)
CLASS_NAMES = [
    "Alluvial Soil", "Black Soil", "Clay Soil", "Red Soil"
]

@app.route("/predict-soil", methods=["POST"])
def predict_soil():
    print("=" * 50)
    print("PREDICT ROUTE CALLED!")
    print("=" * 50)
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    # Save temporarily
    image_path = "temp.jpg"
    image.save(image_path)

    # Preprocess (same as training)
    img = load_img(image_path, target_size=(150, 150))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # ===== DEBUG PRINTS =====
    print("\n🔍 WEB APP DEBUG INFO:")
    print("-" * 40)
    print(f"Image shape: {img_array.shape}")
    print(f"Min value: {img_array.min()}")
    print(f"Max value: {img_array.max()}")
    print(f"Mean value: {img_array.mean()}")
    print(f"Dtype: {img_array.dtype}")
    print("-" * 40)
    # ========================

    # Predict
    preds = model.predict(img_array)
    class_index = int(np.argmax(preds[0]))
    confidence = float(preds[0][class_index]) * 100
    
    # ===== PREDICTION DEBUG =====
    print("\n📊 PREDICTION RESULTS:")
    print("-" * 40)
    for i, prob in enumerate(preds[0]):
        print(f"{CLASS_NAMES[i]}: {prob * 100:.2f}%")
    print(f"Final: {CLASS_NAMES[class_index]} ({confidence:.2f}%)")
    print("-" * 40 + "\n")
    # ===========================

    os.remove(image_path)

    return jsonify({
        "soilType": CLASS_NAMES[class_index],
        "confidence": round(confidence, 2)
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)
