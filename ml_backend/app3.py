# # app.py

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import numpy as np
# import joblib
# import requests
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
# import os

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
# app.config['CORS_HEADERS'] = 'Content-Type'

# # ===============================
# # Load Models
# # ===============================

# crop_model = joblib.load("crop_model1.pkl")
# crop_encoder = joblib.load("crop_encoder.pkl")

# soil_model = load_model("SoilNet.h5")

# # Soil classes (must match training order)
# soil_classes = ["alluvial", "black", "clay", "red"]

# # ===============================
# # Soil Suitability Table
# # ===============================

# soil_suitability = {
#     "rice": ["alluvial", "clay"],
#     "maize": ["alluvial", "red"],
#     "kidneybeans": ["red", "alluvial"],
#     "pigeonpeas": ["red", "black"],
#     "mothbeans": ["red"],
#     "mungbean": ["red", "alluvial"],
#     "blackgram": ["alluvial", "black"],
#     "lentil": ["alluvial", "black"],
#     "banana": ["alluvial", "black"],
#     "pomegranate": ["black", "alluvial"],
#     "mango": ["alluvial", "red"],
#     "grapes": ["black", "red"],
#     "watermelon": ["alluvial", "red"],
#     "muskmelon": ["alluvial"],
#     "apple": ["red"],
#     "orange": ["alluvial", "red"],
#     "papaya": ["alluvial", "red"],
#     "coconut": ["alluvial"],
#     "cotton": ["black"],
#     "jute": ["alluvial"],
#     "coffee": ["red"]
# }

# # ===============================
# # Weather API Function
# # ===============================

# def get_weather_data(city):

#     API_KEY = "bd441c8d46b08d94656c0644b95858ee"
#     url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"

#     response = requests.get(url)
#     data = response.json()

#     temperature = data["main"]["temp"]
#     humidity = data["main"]["humidity"]

#     # Rainfall may not always exist
#     rainfall = data.get("rain", {}).get("1h", 0)

#     return temperature, humidity, rainfall


# # ===============================
# # Soil Prediction Function
# # ===============================

# def predict_soil(img_path):

#     # MUST match training size
#     img = image.load_img(img_path, target_size=(150, 150))
#     img_array = image.img_to_array(img) / 255.0
#     img_array = np.expand_dims(img_array, axis=0)

#     prediction = soil_model.predict(img_array)
#     soil_index = np.argmax(prediction)

#     return soil_classes[soil_index]

# # ===============================
# # Crop Recommendation Endpoint
# # ===============================

# @app.route("/recommend", methods=["POST"])
# def recommend():

#     # Get location
#     city = request.form.get("location")

#     # Get image
#     file = request.files["image"]
#     img_path = "temp.jpg"
#     file.save(img_path)

#     # Step 1: Soil Prediction
#     predicted_soil_raw = predict_soil(img_path)

#     predicted_soil = predicted_soil_raw.lower().replace(" soil", "")

#     # Step 2: Weather Data
#     temperature, humidity, rainfall = get_weather_data(city)

#     # Step 3: Crop Prediction
#     input_data = np.array([[temperature, humidity, rainfall]])
#     probabilities = crop_model.predict_proba(input_data)

#     top_5_indices = np.argsort(probabilities[0])[-5:][::-1]
#     top_5_crops = crop_encoder.inverse_transform(top_5_indices)

#     # Step 4: Soil Filtering
#  # ===============================
# # Soil Filtering (Improved)
# # ===============================

#     print("\n===== SOIL FILTER DEBUG =====")
#     print("Predicted Soil:", predicted_soil)
#     print("Top 5 Climate Crops:", list(top_5_crops))

#     best_crop = None
#     best_prob = 0
#     soil_compatible_crops = []

#     for i, crop in enumerate(crop_encoder.classes_):
#         crop_lower = crop.lower()

#         if crop_lower in soil_suitability:
#             if predicted_soil in soil_suitability[crop_lower]:
#                 prob = probabilities[0][i]
#                 soil_compatible_crops.append(crop_lower)

#                 print(f"Checking {crop_lower} | Prob: {prob:.4f}")

#                 if prob > best_prob:
#                     best_prob = prob
#                     best_crop = crop_lower

#     if best_crop:
#         recommended_crop = best_crop
#         print("✅ Soil-compatible crop selected:", recommended_crop)
#     else:
#         recommended_crop = top_5_crops[0].lower()
#         print("⚠ No soil-compatible crop found. Falling back.")

#     print("Final Recommended Crop:", recommended_crop)
#     print("================================")

#     return jsonify({
#         "soil_type": predicted_soil,
#         "temperature": temperature,
#         "humidity": humidity,
#         "rainfall": rainfall,
#         "recommended_crop": recommended_crop,
#         "top_5_climate_crops": list(top_5_crops),
#         "soil_compatible_crops": soil_compatible_crops
#     })

# if __name__ == "__main__":
#     app.run(debug=True)

# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import requests
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

app = Flask(__name__)
CORS(app)

# ===============================
# Load Models
# ===============================

crop_model = joblib.load("crop_model1.pkl")
soil_model = load_model("SoilNet.h5")

# Soil classes (same as training)
soil_classes = ["alluvial", "black", "clay", "red"]

# Soil → soil_id mapping
soil_mapping = {
    "alluvial": 0,
    "black": 1,
    "clay": 2,
    "red": 3
}

# ===============================
# Weather API
# ===============================

def get_weather_data(city):

    API_KEY = "bd441c8d46b08d94656c0644b95858ee"

    city = city.split(",")[0]

    if "(" in city:
        city = city.split("(")[0].strip()

    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"

    response = requests.get(url)
    data = response.json()

    print("FULL FORECAST RESPONSE:")
    print(data)

    if "list" not in data:
        return 25, 70, 50

    temperature = data["list"][0]["main"]["temp"]
    humidity = data["list"][0]["main"]["humidity"]

    rainfall_3h = data["list"][0].get("rain", {}).get("3h", 0)

    daily_rain = rainfall_3h * 8

    monthly_rain = daily_rain * 30

    rainfall = min(monthly_rain, 300)

    return temperature, humidity, rainfall

# ===============================
# Soil Prediction
# ===============================

def predict_soil(img_path):

    img = image.load_img(img_path, target_size=(150,150))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = soil_model.predict(img_array)

    soil_index = np.argmax(prediction)

    return soil_classes[soil_index]


# ===============================
# Crop Recommendation Endpoint
# ===============================

@app.route("/recommend", methods=["POST"])
def recommend():

    city = request.form.get("location")

    file = request.files["image"]
    img_path = "temp.jpg"
    file.save(img_path)

    # Step 1 — Predict Soil
    predicted_soil = predict_soil(img_path)

    soil_id = soil_mapping[predicted_soil]

    # Step 2 — Get Weather
    temperature, humidity, rainfall = get_weather_data(city)

    # Step 3 — Irrigation value (assumed irrigated)
    irrigation = 1

    # Step 4 — Prepare Input
    input_data = pd.DataFrame([{
    "temperature": temperature,
    "humidity": humidity,
    "rainfall": rainfall,
    "irrigation": irrigation,
    "soil_id": soil_id
    }])

    print("Model Input:", input_data)

    # Step 5 — Prediction probabilities
    probabilities = crop_model.predict_proba(input_data)

    # Step 6 — Top 5 crops
    top5_indices = np.argsort(probabilities[0])[-5:][::-1]

    crops = crop_model.classes_

    soil_suitability = {

    "alluvial": [
    "rice","maize","kidneybeans","mungbean","blackgram",
    "lentil","banana","pomegranate","mango","watermelon",
    "muskmelon","orange","papaya","coconut","jute"
    ],

    "black": [
    "pigeonpeas","blackgram","lentil","banana",
    "pomegranate","grapes","cotton"
    ],

    "red": [
    "maize","kidneybeans","pigeonpeas","mothbeans",
    "mungbean","mango","grapes","watermelon",
    "apple","orange","papaya","coffee"
    ],

    "clay": [
    "rice"
    ]

    }

    top5_crops = [crops[i] for i in top5_indices]

    allowed_crops = soil_suitability.get(predicted_soil, [])

    filtered = [crop for crop in top5_crops if crop in allowed_crops]

    # if filtered:
    #     recommended_crop = filtered[0]
    # else:
    recommended_crop = top5_crops[0]

    response_data = {
    "soil_type": predicted_soil,
    "temperature": temperature,
    "humidity": humidity,
    "rainfall": rainfall,
    "recommended_crop": recommended_crop,
    "top_5_crops": top5_crops
}

    print("Response:", response_data)

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True)