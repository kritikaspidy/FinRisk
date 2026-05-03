def calculate_dti(income, debt):
    if income == 0:
        return 1
    return debt / income