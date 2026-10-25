from django.shortcuts import render
from pathlib import Path
import pickle
from django.conf import settings
import pandas as pd

# setting model path
MODEL_DIR = Path(settings.BASE_DIR) / "prediction" / "ml_models"

# set model file in variable
with open(MODEL_DIR / "heart_model.pkl", "rb") as f:
    model = pickle.load(f)

# set scaler file in variable
with open(MODEL_DIR / "scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


# ======================= 
        # Columns
# =======================


FEATURES = [
    "age",
    "sex",
    "chest pain type",
    "resting bp s",
    "cholesterol",
    "fasting blood sugar",
    "resting ecg",
    "max heart rate",
    "exercise angina",
    "oldpeak",
    "ST slope",
]

NUMERICAL_COLS = [
    "age",
    "resting bp s",
    "cholesterol",
    "max heart rate",
    "oldpeak",
]


# ======================= 
        # Views
# =======================

def home(request):
    if request.method != "POST":
        return render(request, "index.html")

    try:
        form_fields = {
            "age": "age",
            "sex": "sex",
            "chest pain type": "chest_pain_type",
            "resting bp s": "resting_bp",
            "cholesterol": "cholesterol",
            "fasting blood sugar": "fasting_blood_sugar",
            "resting ecg": "resting_ecg",
            "max heart rate": "max_heart_rate",
            "exercise angina": "exercise_angina",
            "oldpeak": "oldpeak",
            "ST slope": "st_slope",
        }

        values = {
            feature: float(request.POST[field])
            for feature, field in form_fields.items()
        }

        input_data = pd.DataFrame(
            [[values[feature] for feature in FEATURES]],
            columns=FEATURES,
        )

        input_data[NUMERICAL_COLS] = scaler.transform(
            input_data[NUMERICAL_COLS]
        )

        prediction = int(model.predict(input_data)[0])

        if prediction == 1:
            return render(request, "high-risk.html")

        return render(request, "low-risk.html")

    except (ValueError, TypeError, KeyError):
        return render(
            request,
            "index.html",
            {"error": "Please enter valid values in all fields."},
        )