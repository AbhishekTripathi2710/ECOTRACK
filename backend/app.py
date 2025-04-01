from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# ML Service URL
ML_SERVICE_URL = os.getenv('ML_SERVICE_URL', 'http://localhost:5001')

@app.route('/api/ml/predictions', methods=['POST'])
def get_ml_predictions():
    try:
        # Forward the request to ML service
        response = requests.post(f'{ML_SERVICE_URL}/predictions', json=request.json)
        
        # Check if request was successful
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': response.json().get('error', 'ML service error')}), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to connect to ML service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 