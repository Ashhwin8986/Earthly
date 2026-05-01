from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.efficientnet import preprocess_input
import os
import base64

app = Flask(__name__)
CORS(app)

# =========================
# CONFIG
# =========================
MODEL_PATH = "plant_disease_model2.tflite"
TRAIN_DIR = "E:/PV_Balanced/TRAIN"
IMAGE_SIZE = (224, 224)

# =========================
# LOAD CLASS NAMES
# =========================
CLASS_NAMES = sorted(os.listdir(TRAIN_DIR))

print("Classes loaded:")
for i, name in enumerate(CLASS_NAMES):
    print(f"{i}: {name}")

# =========================
# LOAD TFLITE MODEL
# =========================
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("\nModel loaded successfully!")

# =========================
# PREPROCESS IMAGE
# =========================
def preprocess_img(path):
    img = load_img(path, target_size=IMAGE_SIZE)
    arr = img_to_array(img)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr.astype(np.float32)

# =========================
# EXTRACT PLANT + DISEASE
# =========================
def extract_info(predicted_class):
    clean_name = predicted_class.replace("___", "_").replace("__", "_")
    parts = [p for p in clean_name.split("_") if p != ""]

    # Plant name fix
    if parts[0].lower() == "pepper":
        plant_type = "Bell Pepper"
        disease_parts = parts[2:]  # skip "bell"
    else:
        plant_type = parts[0]
        disease_parts = parts[1:]

    # Disease
    if "healthy" in predicted_class.lower():
        disease_name = "Healthy"
    else:
        disease_name = " ".join(disease_parts)

    disease_name = disease_name.replace("_", " ").title()

    return plant_type, disease_name

# =========================
# API ROUTE
# =========================
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

        interpreter.set_tensor(input_details[0]['index'], x)
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]['index'])

        # ✅ IMPORTANT FIX: DO NOT APPLY SOFTMAX AGAIN
        probs = preds[0]

        # If your model outputs logits, use this instead:
        # probs = tf.nn.softmax(preds[0]).numpy()

        class_index = int(np.argmax(probs))
        confidence = float(probs[class_index]) * 100
        predicted_class = CLASS_NAMES[class_index]

        # =========================
        # Extract plant + disease
        # =========================
        plant_type, disease_name = extract_info(predicted_class)

        sorted_idx = np.argsort(probs)[::-1]

        top2 = sorted_idx[1]
        top3 = sorted_idx[2]

        top_predictions = [
            {
                "plant": extract_info(CLASS_NAMES[top2])[0],
                "disease": extract_info(CLASS_NAMES[top2])[1],
                "confidence": round(float(probs[top2]) * 100, 2)
            },
            {
                "plant": extract_info(CLASS_NAMES[top3])[0],
                "disease": extract_info(CLASS_NAMES[top3])[1],
                "confidence": round(float(probs[top3]) * 100, 2)
            }
        ]

        # =========================
        # Convert image to base64
        # =========================
        with open(temp_path, "rb") as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode("utf-8")

        # =========================
        # Debug logs
        # =========================
        print("RAW CLASS:", predicted_class)
        print("PLANT:", plant_type)
        print("DISEASE:", disease_name)
        print("CONFIDENCE:", confidence)

        # =========================
        # Response
        # =========================
        response = {
            "plantType": plant_type,
            "disease": disease_name,
            "confidence": round(confidence, 2),
            "prediction": predicted_class,
            "topPredictions": top_predictions,
            "image": f"data:image/jpeg;base64,{img_base64}"   # ✅ FIX
        }

        return jsonify(response)

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(port=5001, debug=True)