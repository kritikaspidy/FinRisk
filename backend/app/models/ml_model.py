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

# ── Per-factor explanation ────────────────────────────────────────────────────
# "Typical applicant" = midpoint of the ranges the model was trained on.
BASELINE = {
    "income": 107_500, "debt": 40_000, "credit_utilization": 50,
    "past_default": 0, "employment_years": 10, "num_loans": 4, "late_payments": 2,
}
LABELS = {
    "income": "Monthly income", "debt": "Monthly debt",
    "credit_utilization": "Credit use", "past_default": "Past default",
    "employment_years": "Years employed", "num_loans": "Active loans",
    "late_payments": "Late payments",
}

def explain_risk(data):
    """Points of default probability each input adds (+) or removes (-) compared
    with a typical applicant. Uses only predict_proba, so it survives retraining."""
    p = predict_risk(data)
    out = []
    for key, base in BASELINE.items():
        shifted = dict(data)
        shifted[key] = base
        out.append({
            "key": key, "label": LABELS[key], "value": data[key],
            "impact": round((p - predict_risk(shifted)) * 100, 1),
        })
    return sorted(out, key=lambda c: -abs(c["impact"]))
