from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
from datetime import datetime, timedelta
import pandas as pd
from scipy import stats
import joblib
import os
from sklearn.ensemble import GradientBoostingRegressor
from xgboost import XGBRegressor

app = Flask(__name__)
CORS(app)

# Constants
MODEL_PATH = 'models/model.joblib'
SCALER_PATH = 'models/scaler.joblib'
MIN_DATA_POINTS = 30
ANOMALY_THRESHOLD = 2.0

# Define feature columns globally
FEATURE_COLUMNS = [
    'day_of_week', 'month', 'day_of_month', 'is_weekend',
    'prev_day_footprint', 'prev_week_footprint',
    'rolling_mean_7d', 'rolling_std_7d'
]

def load_or_create_model():
    """Load existing model or create a new one"""
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            if model is not None and scaler is not None:
                return model, scaler
    except Exception as e:
        print(f"Error loading model: {str(e)}")
    return None, None

def prepare_data(historical_data):
    """Enhanced data preparation with validation and feature engineering"""
    try:
        # Convert to DataFrame
        df = pd.DataFrame(historical_data)
        
        # Validate required columns
        required_columns = ['date', 'carbonFootprint']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("Missing required columns in data")
        
        # Convert and validate dates
        df['date'] = pd.to_datetime(df['date'])
        if df['date'].isnull().any():
            raise ValueError("Invalid date format in data")
        
        # Sort by date
        df = df.sort_values('date')
        
        # Handle missing values
        df['carbonFootprint'] = df['carbonFootprint'].ffill().bfill()
        
        # Feature engineering
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Add lag features
        df['prev_day_footprint'] = df['carbonFootprint'].shift(1)
        df['prev_week_footprint'] = df['carbonFootprint'].shift(7)
        df['rolling_mean_7d'] = df['carbonFootprint'].rolling(window=7, min_periods=1).mean()
        df['rolling_std_7d'] = df['carbonFootprint'].rolling(window=7, min_periods=1).std()
        
        # Fill NaN values in lag features with mean
        lag_columns = ['prev_day_footprint', 'prev_week_footprint', 'rolling_mean_7d', 'rolling_std_7d']
        for col in lag_columns:
            df[col] = df[col].fillna(df[col].mean())
        
        return df
    except Exception as e:
        raise ValueError(f"Data preparation failed: {str(e)}")

def select_best_model(X, y):
    """Select the best model using cross-validation and grid search"""
    try:
        # Define models to try
        models = {
            'linear': LinearRegression(),
            'rf': RandomForestRegressor(random_state=42)
        }
        
        # Define parameter grids for grid search
        param_grids = {
            'rf': {
                'n_estimators': [100, 200],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5],
                'min_samples_leaf': [1, 2]
            }
        }
        
        best_score = float('-inf')
        best_model = None
        
        for name, model in models.items():
            if name in param_grids:
                # Use GridSearchCV for models with hyperparameters
                grid_search = GridSearchCV(
                    model,
                    param_grids[name],
                    cv=5,
                    scoring='r2',
                    n_jobs=-1
                )
                grid_search.fit(X, y)
                score = grid_search.best_score_
                model = grid_search.best_estimator_
            else:
                # Use cross-validation for simple models
                scores = cross_val_score(model, X, y, cv=5, scoring='r2')
                score = scores.mean()
            
            if score > best_score:
                best_score = score
                best_model = model
        
        return best_model, best_score
    except Exception as e:
        raise ValueError(f"Model selection failed: {str(e)}")

def train_model(df):
    """Enhanced model training with better feature engineering and validation"""
    try:
        # Define features
        feature_columns = [
            'day_of_week', 'month', 'day_of_month', 'is_weekend',
            'prev_day_footprint', 'prev_week_footprint',
            'rolling_mean_7d', 'rolling_std_7d'
        ]
        
        X = df[feature_columns]
        y = df['carbonFootprint']
        
        # Split data into training and validation sets
        train_size = int(len(df) * 0.8)
        X_train = X[:train_size]
        y_train = y[:train_size]
        X_val = X[train_size:]
        y_val = y[train_size:]
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)
        
        # Convert back to DataFrame to preserve feature names
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=feature_columns)
        X_val_scaled = pd.DataFrame(X_val_scaled, columns=feature_columns)
        
        # Train model
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            min_samples_split=5,
            random_state=42
        )
        
        # Fit model
        model.fit(X_train_scaled, y_train)
        
        # Get validation score
        val_score = model.score(X_val_scaled, y_val)
        
        # Save model and scaler
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, 'models/model.joblib')
        joblib.dump(scaler, 'models/scaler.joblib')
        
        return model, scaler, val_score
    except Exception as e:
        raise ValueError(f"Model training failed: {str(e)}")

def detect_anomalies(df):
    """Enhanced anomaly detection using multiple methods"""
    try:
        anomalies = []
        
        # Ensure we have enough data
        if len(df) < 7:
            return anomalies
        
        # Calculate rolling statistics
        rolling_mean = df['carbonFootprint'].rolling(window=7, min_periods=1).mean()
        rolling_std = df['carbonFootprint'].rolling(window=7, min_periods=1).std()
        
        # Calculate z-scores
        z_scores = (df['carbonFootprint'] - rolling_mean) / rolling_std
        
        # Detect anomalies using z-score method
        for i in range(len(df)):
            if abs(z_scores[i]) > 2:  # More than 2 standard deviations
                anomalies.append({
                    'date': df['date'].iloc[i].strftime('%Y-%m-%d'),
                    'value': float(df['carbonFootprint'].iloc[i]),
                    'expected_range': f"{rolling_mean.iloc[i] - 2 * rolling_std.iloc[i]:.2f} - {rolling_mean.iloc[i] + 2 * rolling_std.iloc[i]:.2f}",
                    'detection_method': 'Z-score'
                })
        
        return anomalies
    except Exception as e:
        print(f"Anomaly detection error: {str(e)}")
        return []

def generate_insights(df):
    """Enhanced insights generation with better statistical analysis"""
    try:
        insights = []
        
        # Basic statistics
        mean_footprint = df['carbonFootprint'].mean()
        std_footprint = df['carbonFootprint'].std()
        
        # Trend analysis with confidence interval
        trend = df['carbonFootprint'].pct_change().mean()
        trend_std = df['carbonFootprint'].pct_change().std()
        if abs(trend) > trend_std:  # Only report trend if significant
            if trend > 0:
                insights.append(f"Your carbon footprint has been increasing by {trend*100:.1f}% per day")
            else:
                insights.append(f"Your carbon footprint has been decreasing by {abs(trend)*100:.1f}% per day")
        
        # Peak analysis with context
        peak_day = df.loc[df['carbonFootprint'].idxmax()]
        peak_value = peak_day['carbonFootprint']
        if peak_value > mean_footprint + 2 * std_footprint:  # More lenient threshold
            insights.append(f"Highest carbon footprint ({peak_value:.1f} kg CO2) was recorded on {peak_day['date'].strftime('%Y-%m-%d')}")
        
        # Weekly patterns
        weekly_avg = df.groupby('day_of_week')['carbonFootprint'].mean()
        highest_day = weekly_avg.idxmax()
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        # Weekend effect
        weekend_days = [5, 6]
        weekday_days = [0, 1, 2, 3, 4]
        weekend_avg = df[df['day_of_week'].isin(weekend_days)]['carbonFootprint'].mean()
        weekday_avg = df[df['day_of_week'].isin(weekday_days)]['carbonFootprint'].mean()
        
        if weekend_avg > weekday_avg * 1.1:  # More lenient threshold (10% difference)
            insights.append(f"Your carbon footprint is {((weekend_avg/weekday_avg)-1)*100:.1f}% higher on weekends")
        
        # Monthly patterns
        monthly_avg = df.groupby('month')['carbonFootprint'].mean()
        highest_month = monthly_avg.idxmax()
        months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
        
        # Only report monthly pattern if there's significant variation
        if monthly_avg.std() > monthly_avg.mean() * 0.05:  # More lenient threshold (5% variation)
            insights.append(f"Your carbon footprint is typically highest in {months[highest_month-1]}")
        
        # Source-specific insights if available
        source_columns = ['transportation', 'energy', 'waste', 'food']
        available_sources = [col for col in source_columns if col in df.columns]
        
        if available_sources:
            source_impacts = {col: df[col].mean() for col in available_sources}
            max_source = max(source_impacts.items(), key=lambda x: x[1])
            
            if max_source[1] > mean_footprint * 0.3:  # More lenient threshold (30% contribution)
                insights.append(f"{max_source[0].capitalize()} contributes {max_source[1]/mean_footprint*100:.1f}% of your total footprint")
        
        return insights
    except Exception as e:
        print(f"Insights generation error: {str(e)}")  # Add debug logging
        return []  # Return empty list instead of raising error

def generate_recommendations(df, anomalies):
    """Enhanced recommendations based on data analysis"""
    try:
        recommendations = []
        
        # Analyze patterns and anomalies
        if len(anomalies) > 0:
            anomaly_dates = [a['date'] for a in anomalies]
            recommendations.append(f"Investigate causes of high emissions on {', '.join(anomaly_dates[:3])}")
        
        # Calculate baseline and improvement potential
        mean_footprint = df['carbonFootprint'].mean()
        std_footprint = df['carbonFootprint'].std()
        
        if mean_footprint > 20:
            recommendations.append(f"Your average daily carbon footprint ({mean_footprint:.1f} kg CO2) is above recommended levels")
        
        # Analyze emission sources if available
        source_columns = ['transportation', 'energy', 'waste', 'food']
        available_sources = [col for col in source_columns if col in df.columns]
        
        if available_sources:
            source_impacts = {col: df[col].mean() for col in available_sources}
            max_source = max(source_impacts.items(), key=lambda x: x[1])
            
            if max_source[1] > mean_footprint * 0.4:  # If any source contributes >40%
                recommendations.append(f"Focus on reducing {max_source[0]} emissions, which contributes {max_source[1]/mean_footprint*100:.1f}% of your total footprint")
        
        # Add personalized recommendations based on patterns
        if 'transportation' in df.columns:
            transport_impact = df['transportation'].mean()
            if transport_impact > 10:
                recommendations.append("Consider carpooling or using public transport more often")
        
        if 'energy' in df.columns:
            energy_impact = df['energy'].mean()
            if energy_impact > 8:
                recommendations.append("Look into energy-efficient appliances and renewable energy sources")
        
        if 'waste' in df.columns:
            waste_impact = df['waste'].mean()
            if waste_impact > 5:
                recommendations.append("Focus on reducing waste and improving recycling habits")
        
        # Add general recommendations only if we don't have enough specific ones
        if len(recommendations) < 3:
            recommendations.extend([
                "Consider setting up a home energy monitoring system",
                "Look into carbon offset programs",
                "Try to reduce food waste and eat more plant-based meals",
                "Consider installing solar panels or other renewable energy sources"
            ])
        
        return recommendations[:5]  # Limit to top 5 most relevant recommendations
    except Exception as e:
        raise ValueError(f"Recommendations generation failed: {str(e)}")

def predict_future(df, model, scaler, days=5):
    """Enhanced prediction function with better feature engineering"""
    try:
        last_date = df['date'].max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(days)]
        
        predictions = []
        current_df = df.copy()
        
        # Define feature columns
        feature_columns = [
            'day_of_week', 'month', 'day_of_month', 'is_weekend',
            'prev_day_footprint', 'prev_week_footprint',
            'rolling_mean_7d', 'rolling_std_7d'
        ]
        
        for future_date in future_dates:
            # Create new row with all required columns
            new_row = pd.DataFrame({
                'date': [future_date],
                'carbonFootprint': [None],
                'day_of_week': [future_date.weekday()],
                'month': [future_date.month],
                'day_of_month': [future_date.day],
                'is_weekend': [1 if future_date.weekday() >= 5 else 0],
                'prev_day_footprint': [current_df['carbonFootprint'].iloc[-1]],
                'prev_week_footprint': [current_df['carbonFootprint'].iloc[-7] if len(current_df) >= 7 else current_df['carbonFootprint'].iloc[-1]],
                'rolling_mean_7d': [current_df['carbonFootprint'].rolling(window=7, min_periods=1).mean().iloc[-1]],
                'rolling_std_7d': [current_df['carbonFootprint'].rolling(window=7, min_periods=1).std().iloc[-1]]
            })
            
            # Add the new row to get correct feature engineering
            temp_df = pd.concat([current_df, new_row], ignore_index=True)
            
            # Get features for prediction
            X_pred = temp_df.iloc[-1:][feature_columns]
            X_pred_scaled = scaler.transform(X_pred)
            
            # Convert back to DataFrame to preserve feature names
            X_pred_scaled = pd.DataFrame(X_pred_scaled, columns=feature_columns)
            
            # Make prediction
            pred = model.predict(X_pred_scaled)[0]
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted': round(float(pred), 2)
            })
            
            # Update the current_df with the prediction for the next iteration
            current_df = pd.concat([
                current_df,
                pd.DataFrame({
                    'date': [future_date],
                    'carbonFootprint': [pred],
                    'day_of_week': [future_date.weekday()],
                    'month': [future_date.month],
                    'day_of_month': [future_date.day],
                    'is_weekend': [1 if future_date.weekday() >= 5 else 0],
                    'prev_day_footprint': [current_df['carbonFootprint'].iloc[-1]],
                    'prev_week_footprint': [current_df['carbonFootprint'].iloc[-7] if len(current_df) >= 7 else current_df['carbonFootprint'].iloc[-1]],
                    'rolling_mean_7d': [current_df['carbonFootprint'].rolling(window=7, min_periods=1).mean().iloc[-1]],
                    'rolling_std_7d': [current_df['carbonFootprint'].rolling(window=7, min_periods=1).std().iloc[-1]]
                })
            ], ignore_index=True)
        
        return predictions
    except Exception as e:
        raise ValueError(f"Prediction failed: {str(e)}")

def generate_sample_data(days=30):
    """Generate sample carbon footprint data for testing"""
    import numpy as np
    from datetime import datetime, timedelta
    
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

@app.route('/predictions', methods=['POST'])
def get_predictions():
    try:
        data = request.json
        historical_data = data.get('historicalData', [])
        
        if not historical_data:
            return jsonify({'error': 'No historical data provided'}), 400
        
        if len(historical_data) < MIN_DATA_POINTS:
            return jsonify({'error': f'Insufficient data. Need at least {MIN_DATA_POINTS} data points'}), 400
        
        # Prepare data
        df = prepare_data(historical_data)
        
        # Try to load existing model and scaler
        model = None
        scaler = None
        model_score = 0.0
        
        try:
            if os.path.exists('models/model.joblib') and os.path.exists('models/scaler.joblib'):
                model = joblib.load('models/model.joblib')
                scaler = joblib.load('models/scaler.joblib')
                # Calculate model score on current data
                feature_columns = [
                    'day_of_week', 'month', 'day_of_month', 'is_weekend',
                    'prev_day_footprint', 'prev_week_footprint',
                    'rolling_mean_7d', 'rolling_std_7d'
                ]
                X = df[feature_columns]
                y = df['carbonFootprint']
                X_scaled = scaler.transform(X)
                X_scaled = pd.DataFrame(X_scaled, columns=feature_columns)
                model_score = model.score(X_scaled, y)
        except Exception as e:
            print(f"Error loading model: {str(e)}")
        
        # If model loading failed or doesn't exist, train a new one
        if model is None or scaler is None:
            model, scaler, model_score = train_model(df)
        
        # Use the predict_future function for predictions
        forecast_data = predict_future(df, model, scaler, days=30)
        
        # Detect anomalies
        anomalies = detect_anomalies(df)
        
        # Generate insights and recommendations
        insights = generate_insights(df)
        recommendations = generate_recommendations(df, anomalies)
        
        return jsonify({
            'forecastData': forecast_data,
            'anomalies': anomalies,
            'insights': insights,
            'recommendations': recommendations,
            'modelScore': float(model_score)
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500

@app.route('/test-data', methods=['GET'])
def get_test_data():
    """Endpoint to get 30 days of sample data for testing"""
    try:
        test_data = generate_sample_data(days=30)
        return jsonify(test_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 