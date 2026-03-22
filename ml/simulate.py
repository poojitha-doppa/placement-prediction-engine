"""
Monte Carlo Simulation for Placement Prediction
Load model.pkl and run simulations with random noise
"""

import pickle
import numpy as np
import pandas as pd

def load_model():
    """Load trained model from pickle"""
    with open('model.pkl', 'rb') as f:
        return pickle.load(f)

def run_simulations(student_data, num_simulations=500):
    """
    Run Monte Carlo simulations with random noise
    
    Args:
        student_data: dict with features {cgpa, tenth, twelfth, coding, projects, internships, communication}
        num_simulations: number of simulations to run
    
    Returns:
        dict with simulations, mean probability, variance, risk level
    """
    model = load_model()
    features = ['cgpa', 'tenth', 'twelfth', 'coding', 'projects', 'internships', 'communication']
    
    # Convert to array
    X = np.array([[student_data[f] for f in features]])
    
    simulations = []
    probabilities = []
    
    for _ in range(num_simulations):
        # Add small random noise (±5%)
        X_noisy = X + np.random.normal(0, X * 0.05)
        
        # Predict
        prob = model.predict_proba(X_noisy)[0][1]
        simulations.append({
            'probability': float(prob),
            'prediction': 1 if prob >= 0.5 else 0
        })
        probabilities.append(prob)
    
    probabilities = np.array(probabilities)
    mean_prob = float(np.mean(probabilities))
    variance = float(np.var(probabilities))
    
    # Risk level: 0-33% low, 34-66% medium, 67-100% high
    if mean_prob >= 0.67:
        risk_level = "high"
    elif mean_prob >= 0.34:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return {
        'simulations': simulations,
        'mean_probability': mean_prob,
        'variance': variance,
        'risk_level': risk_level
    }

if __name__ == "__main__":
    # Test
    student = {
        'cgpa': 7.5,
        'tenth': 85,
        'twelfth': 80,
        'coding': 60,
        'projects': 2,
        'internships': 1,
        'communication': 75
    }
    
    result = run_simulations(student, num_simulations=500)
    print(f"Mean Probability: {result['mean_probability']:.4f}")
    print(f"Variance: {result['variance']:.6f}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Total Simulations: {len(result['simulations'])}")
