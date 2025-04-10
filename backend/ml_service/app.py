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
MODEL_VERSION = '1.0'
VALIDATION_SIZE = 0.2

# Define feature columns globally
FEATURE_COLUMNS = [
    'day_of_week', 'month', 'day_of_month', 'is_weekend', 'is_holiday',
    'is_winter', 'is_summer', 'daily_change', 'weekly_change', 'monthly_change'
]

# Add lag features
for lag in [1, 2, 3, 7, 14, 30]:
    FEATURE_COLUMNS.append(f'prev_{lag}d_footprint')

# Add rolling statistics
for window in [3, 7, 14, 30]:
    FEATURE_COLUMNS.extend([
        f'rolling_mean_{window}d',
        f'rolling_std_{window}d',
        f'rolling_min_{window}d',
        f'rolling_max_{window}d'
    ])

def load_or_create_model():
    """Load existing model or create a new one"""
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            model_info = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            if model_info is not None and scaler is not None:
                return model_info['model'], scaler, model_info['validation_score']
    except Exception as e:
        print(f"Error loading model: {str(e)}")
    return None, None, None

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
        
        # Set date as index for time-based operations
        df = df.set_index('date')
        
        # Sort by date
        df = df.sort_index()
        
        # Data quality checks
        if df['carbonFootprint'].isnull().sum() > len(df) * 0.1:  # More than 10% missing
            raise ValueError("Too many missing values in carbon footprint data")
        
        if df['carbonFootprint'].min() < 0:
            raise ValueError("Negative carbon footprint values detected")
        
        # Handle missing values with interpolation
        df['carbonFootprint'] = df['carbonFootprint'].interpolate(method='time')
        
        # Reset index to get date back as a column
        df = df.reset_index()
        
        # Enhanced feature engineering
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_holiday'] = df['day_of_week'].isin([0, 6]).astype(int)  # Weekend as holiday
        
        # Add lag features with multiple time windows
        for lag in [1, 2, 3, 7, 14, 30]:
            df[f'prev_{lag}d_footprint'] = df['carbonFootprint'].shift(lag)
            # Fill NaN values for lag features using forward fill
            df[f'prev_{lag}d_footprint'] = df[f'prev_{lag}d_footprint'].ffill()
        
        # Add rolling statistics with multiple windows
        for window in [3, 7, 14, 30]:
            df[f'rolling_mean_{window}d'] = df['carbonFootprint'].rolling(window=window, min_periods=1).mean()
            df[f'rolling_std_{window}d'] = df['carbonFootprint'].rolling(window=window, min_periods=1).std()
            df[f'rolling_min_{window}d'] = df['carbonFootprint'].rolling(window=window, min_periods=1).min()
            df[f'rolling_max_{window}d'] = df['carbonFootprint'].rolling(window=window, min_periods=1).max()
            
            # Fill NaN values for rolling statistics
            df[f'rolling_mean_{window}d'] = df[f'rolling_mean_{window}d'].ffill()
            df[f'rolling_std_{window}d'] = df[f'rolling_std_{window}d'].fillna(0.0)  # No variation if only one value
            df[f'rolling_min_{window}d'] = df[f'rolling_min_{window}d'].ffill()
            df[f'rolling_max_{window}d'] = df[f'rolling_max_{window}d'].ffill()
        
        # Add trend features
        df['daily_change'] = df['carbonFootprint'].diff()
        df['weekly_change'] = df['carbonFootprint'].diff(7)
        df['monthly_change'] = df['carbonFootprint'].diff(30)
        
        # Fill NaN values for trend features
        df['daily_change'] = df['daily_change'].fillna(0.0)
        df['weekly_change'] = df['weekly_change'].fillna(0.0)
        df['monthly_change'] = df['monthly_change'].fillna(0.0)
        
        # Add seasonal features
        df['is_winter'] = df['month'].isin([12, 1, 2]).astype(int)
        df['is_summer'] = df['month'].isin([6, 7, 8]).astype(int)
        
        # Ensure all required features are present
        missing_features = set(FEATURE_COLUMNS) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Select only the required features in the correct order
        df = df[['date', 'carbonFootprint'] + FEATURE_COLUMNS]
        
        # Final check for any remaining NaN values
        if df[FEATURE_COLUMNS].isnull().any().any():
            # Fill any remaining NaN values with appropriate defaults
            for col in FEATURE_COLUMNS:
                if df[col].isnull().any():
                    if col.endswith('_std'):
                        df[col] = df[col].fillna(0.0)
                    else:
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
            'day_of_week', 'month', 'day_of_month', 'is_weekend', 'is_holiday',
            'is_winter', 'is_summer', 'daily_change', 'weekly_change', 'monthly_change'
        ]
        
        # Add lag features
        for lag in [1, 2, 3, 7, 14, 30]:
            feature_columns.append(f'prev_{lag}d_footprint')
        
        # Add rolling statistics
        for window in [3, 7, 14, 30]:
            feature_columns.extend([
                f'rolling_mean_{window}d',
                f'rolling_std_{window}d',
                f'rolling_min_{window}d',
                f'rolling_max_{window}d'
            ])
        
        X = df[feature_columns]
        y = df['carbonFootprint']
        
        # Split data into training and validation sets using a fixed random state
        train_size = int(len(df) * (1 - VALIDATION_SIZE))
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
        
        # Train model with fixed random state and hyperparameter tuning
        model = GradientBoostingRegressor(
            n_estimators=200,  # Increased number of trees
            learning_rate=0.05,  # Reduced learning rate
            max_depth=4,  # Slightly increased depth
            min_samples_split=5,
            min_samples_leaf=2,
            subsample=0.8,  # Added subsampling
            random_state=42
        )
        
        # Fit model
        model.fit(X_train_scaled, y_train)
        
        # Get validation score
        val_score = model.score(X_val_scaled, y_val)
        
        # Save model and scaler with version info
        os.makedirs('models', exist_ok=True)
        model_info = {
            'model': model,
            'version': MODEL_VERSION,
            'validation_score': val_score,
            'training_date': datetime.now().strftime('%Y-%m-%d'),
            'feature_columns': feature_columns,
            'training_size': len(X_train),
            'validation_size': len(X_val)
        }
        joblib.dump(model_info, 'models/model.joblib')
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

def generate_recommendations(df, anomalies=None):
    """Enhanced recommendations based on data analysis"""
    try:
        recommendations = []
        
        # Analyze patterns and anomalies if provided
        if anomalies and len(anomalies) > 0:
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
    """Enhanced prediction function with better feature engineering and NaN handling"""
    try:
        last_date = df['date'].max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(days)]
        
        predictions = []
        current_df = df.copy()
        
        for future_date in future_dates:
            # Create base features first
            new_row = {
                'date': future_date,
                'carbonFootprint': None,
                'day_of_week': future_date.weekday(),
                'month': future_date.month,
                'day_of_month': future_date.day,
                'is_weekend': 1 if future_date.weekday() >= 5 else 0,
                'is_holiday': 1 if future_date.weekday() in [0, 6] else 0,
                'is_winter': 1 if future_date.month in [12, 1, 2] else 0,
                'is_summer': 1 if future_date.month in [6, 7, 8] else 0
            }
            
            # Calculate lag features with proper NaN handling
            for lag in [1, 2, 3, 7, 14, 30]:
                if len(current_df) >= lag:
                    new_row[f'prev_{lag}d_footprint'] = current_df['carbonFootprint'].iloc[-lag]
                else:
                    # If not enough history, use the most recent value
                    new_row[f'prev_{lag}d_footprint'] = current_df['carbonFootprint'].iloc[-1]
            
            # Calculate rolling statistics with proper NaN handling
            for window in [3, 7, 14, 30]:
                if len(current_df) >= window:
                    new_row[f'rolling_mean_{window}d'] = current_df['carbonFootprint'].rolling(window=window, min_periods=1).mean().iloc[-1]
                    new_row[f'rolling_std_{window}d'] = current_df['carbonFootprint'].rolling(window=window, min_periods=1).std().iloc[-1]
                    new_row[f'rolling_min_{window}d'] = current_df['carbonFootprint'].rolling(window=window, min_periods=1).min().iloc[-1]
                    new_row[f'rolling_max_{window}d'] = current_df['carbonFootprint'].rolling(window=window, min_periods=1).max().iloc[-1]
                else:
                    # If not enough history, use the most recent value for all statistics
                    last_value = current_df['carbonFootprint'].iloc[-1]
                    new_row[f'rolling_mean_{window}d'] = last_value
                    new_row[f'rolling_std_{window}d'] = 0.0  # No variation if only one value
                    new_row[f'rolling_min_{window}d'] = last_value
                    new_row[f'rolling_max_{window}d'] = last_value
            
            # Calculate trend features with proper NaN handling
            if len(current_df) >= 2:
                new_row['daily_change'] = current_df['carbonFootprint'].diff().iloc[-1]
            else:
                new_row['daily_change'] = 0.0
            
            if len(current_df) >= 8:  # Need 7 days for weekly change
                new_row['weekly_change'] = current_df['carbonFootprint'].diff(7).iloc[-1]
            else:
                new_row['weekly_change'] = 0.0
            
            if len(current_df) >= 31:  # Need 30 days for monthly change
                new_row['monthly_change'] = current_df['carbonFootprint'].diff(30).iloc[-1]
            else:
                new_row['monthly_change'] = 0.0
            
            # Convert to DataFrame
            new_row_df = pd.DataFrame([new_row])
            
            # Get features for prediction
            X_pred = new_row_df[FEATURE_COLUMNS]
            X_pred_scaled = scaler.transform(X_pred)
            
            # Convert back to DataFrame to preserve feature names
            X_pred_scaled = pd.DataFrame(X_pred_scaled, columns=FEATURE_COLUMNS)
            
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
                    'carbonFootprint': [pred]
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
    """Enhanced prediction endpoint with better error handling"""
    try:
        data = request.get_json()
        if not data or 'historicalData' not in data:
            return jsonify({'error': 'Missing historical data'}), 400
        
        # Prepare data
        df = prepare_data(data['historicalData'])
        
        # Load or create model
        model, scaler, validation_score = load_or_create_model()
        
        # Get predictions
        predictions = predict_future(df, model, scaler)
        
        # Get insights and recommendations
        insights = generate_insights(df)
        recommendations = generate_recommendations(df)
        
        # Get anomalies
        anomalies = detect_anomalies(df)
        
        return jsonify({
            'modelVersion': MODEL_VERSION,
            'modelScore': validation_score,
            'predictions': predictions,
            'insights': insights,
            'recommendations': recommendations,
            'anomalies': anomalies
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

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