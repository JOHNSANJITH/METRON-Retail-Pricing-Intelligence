import numpy as np

def drift_score(reference, current):
    a = np.asarray(reference, dtype=float); b = np.asarray(current, dtype=float)
    if len(a) == 0 or len(b) == 0: return 0.0
    scale = max(float(np.std(a)), 1e-6)
    return float(abs(np.mean(a)-np.mean(b))/scale)

def drift_state(score):
    return "Normal" if score < .5 else "Watch" if score < 1.0 else "Alert"
