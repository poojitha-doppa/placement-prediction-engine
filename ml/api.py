"""
Flask API for Placement Prediction
Endpoints for prediction and simulation
"""

import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from simulate import run_simulations

app = Flask(__name__)
CORS(app)

# Load model
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

FEATURES = ['cgpa', 'tenth', 'twelfth', 'coding', 'projects', 'internships', 'communication']

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict placement for a student
    Input: JSON with features
    Output: probability and prediction
    """
    try:
        data = request.json
        
        # Extract features
        X = np.array([[data[f] for f in FEATURES]])
        
        # Predict
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0][1]
        
        return jsonify({
            'probability': float(probability),
            'prediction': int(prediction),
            'placed': 'Yes' if prediction == 1 else 'No'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/simulate', methods=['POST'])
def simulate():
    """
    Run Monte Carlo simulation
    Input: JSON with features
    Output: simulations, mean, variance, risk level
    """
    try:
        data = request.json
        
        # Run simulations (reduced from 500 to 100 for better performance)
        result = run_simulations(data, num_simulations=100)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting Flask API on port 5000...")
    app.run(debug=True, port=5000)
