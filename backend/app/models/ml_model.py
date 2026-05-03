import pickle
import pandas as pd

with open("model/model.pkl", "rb") as f:
    model = pickle.load(f)

def predict_risk(data):
    df = pd.DataFrame([data])

    df = df[[
        "income",
        "debt",
        "credit_utilization",
        "past_default",
        "employment_years",
        "num_loans",
        "late_payments"
    ]]

    probability = model.predict_proba(df)[0][1]
    return float(probability)