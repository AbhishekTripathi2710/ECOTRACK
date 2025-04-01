import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

def generate_test_data(days=60):
    """Generate sample carbon footprint data for testing"""
    # Generate dates
    end_date = datetime.now()
    dates = [(end_date - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(days-1, -1, -1)]
    
    # Base values for different emission sources
    base_transport = 5.0
    base_energy = 8.0
    base_waste = 3.0
    base_food = 4.0
    
    data = []
    for date in dates:
        current_date = datetime.strptime(date, '%Y-%m-%d')
        day_of_week = current_date.weekday()
        month = current_date.month
        
        # Weekly pattern (higher on weekends)
        weekend_factor = 1.4 if day_of_week >= 5 else 1.0
        
        # Monthly pattern (higher in winter months)
        winter_factor = 1.2 if month in [12, 1, 2] else 1.0
        
        # Random variations
        random_factor = 1 + (np.random.random() - 0.5) * 0.2  # ±10% random variation
        
        # Generate emission sources with realistic patterns
        transport = base_transport * weekend_factor * random_factor
        energy = base_energy * winter_factor * random_factor
        waste = base_waste * random_factor
        food = base_food * random_factor
        
        # Add some anomalies
        if np.random.random() < 0.05:  # 5% chance of anomaly
            anomaly_factor = 1 + np.random.random() * 0.5  # Up to 50% increase
            transport *= anomaly_factor
        
        # Calculate total footprint
        total_footprint = transport + energy + waste + food
        
        data.append({
            'date': date,
            'carbonFootprint': round(total_footprint, 2),
            'transportation': round(transport, 2),
            'energy': round(energy, 2),
            'waste': round(waste, 2),
            'food': round(food, 2)
        })
    
    return data

def test_ml_service():
    """Test the ML service with sample data"""
    try:
        # Generate test data
        test_data = generate_test_data(days=60)
        
        # Prepare request data
        request_data = {
            'historicalData': test_data
        }
        
        # Send request to ML service
        print("Sending request to ML service...")
        response = requests.post('http://localhost:5001/predictions', json=request_data)
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            print("\nModel Score:", result['modelScore'])
            print("\nInsights:")
            for insight in result['insights']:
                print(f"- {insight}")
            print("\nRecommendations:")
            for rec in result['recommendations']:
                print(f"- {rec}")
            print("\nDetected Anomalies:")
            for anomaly in result['anomalies']:
                print(f"- {anomaly['date']}: {anomaly['value']} kg CO2")
            print("\nForecast Data:")
            for forecast in result['forecastData'][:5]:  # Show first 5 days
                print(f"- {forecast['date']}: {forecast['predicted']} kg CO2")
        else:
            print(f"Error: {response.status_code}")
            print(response.json())
            
    except Exception as e:
        print(f"Test failed: {str(e)}")

if __name__ == '__main__':
    test_ml_service() 