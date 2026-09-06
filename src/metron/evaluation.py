import numpy as np

def regression_metrics(y_true, y_pred):
    y_true = np.asarray(y_true); y_pred = np.asarray(y_pred)
    err = y_true - y_pred
    return {"mae": float(np.mean(np.abs(err))), "rmse": float(np.sqrt(np.mean(err**2))), "wape": float(np.sum(np.abs(err))/max(np.sum(np.abs(y_true)),1e-9))}
