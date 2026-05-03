# train.py  — run once before starting the server: python train.py

import os
import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.calibration import CalibratedClassifierCV

OUTPUT_PATH = os.environ.get("MODEL_PATH", "model/model.pkl")

# ── Synthetic training data ────────────────────────────────────────────────
# Features: [income, debt, credit_utilization, past_default]
# Label:    1 = default, 0 = no default
np.random.seed(42)
N = 600

income  = np.random.uniform(15_000, 200_000, N)
debt    = np.random.uniform(0, 80_000, N)
util    = np.random.uniform(0, 100, N)
default = np.random.randint(0, 2, N)
employment_years = np.random.uniform(0, 20, N)
num_loans = np.random.randint(0, 10, N)
late_payments = np.random.randint(0, 5, N)

dti = debt / income
# Default probability increases with high DTI, high utilization, and past default
prob = 1 / (1 + np.exp(-(
    3 * dti +
    0.02 * util +
    2 * default +
    0.1 * late_payments +
    0.05 * num_loans -
    0.03 * employment_years -
    2
)))
labels = (np.random.rand(N) < prob).astype(int)

X = np.column_stack([
    income,
    debt,
    util,
    default,
    employment_years,
    num_loans,
    late_payments
])
y = labels

# ── Train ─────────────────────────────────────────────────────────────────
base_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("lr", LogisticRegression(C=1.0, max_iter=500, class_weight="balanced", random_state=42)),
])

pipeline = CalibratedClassifierCV(base_pipeline, method='sigmoid', cv=5)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Precision:", precision_score(y_test, y_pred))
print("Recall:", recall_score(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_prob))

# ── Save ──────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "wb") as f:
    pickle.dump(pipeline, f)
print(f"Model saved to {OUTPUT_PATH}")
