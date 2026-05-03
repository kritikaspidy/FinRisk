def evaluate_decision(probability, dti, past_default):
    reasons = []

    # Rule-based checks
    if dti > 0.6:
        reasons.append("High debt-to-income ratio")

    if past_default == 1:
        reasons.append("Past default history")

    # Risk category
    if probability < 0.3:
        risk = "Low"
        decision = "Approve"
    elif probability < 0.7:
        risk = "Medium"
        decision = "Review"
    else:
        risk = "High"
        decision = "Reject"

    # Adjust decision with rules
    if dti > 0.6 or past_default == 1:
        decision = "Reject"

  
    credit_score = int((1 - probability) * 100)

    return {
        "credit_score": credit_score,  # 🔥 FIX
        "risk": risk,
        "decision": decision,
        "reasons": reasons
    }