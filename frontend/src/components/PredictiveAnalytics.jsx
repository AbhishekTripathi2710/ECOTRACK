import React, { useState, useEffect } from 'react';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const PredictiveAnalytics = () => {
    const { footprintHistory, loading, error } = useCarbonFootprint();
    const [forecastData, setForecastData] = useState([]);
    const [timeframe, setTimeframe] = useState('30'); // 30, 60, or 90 days

    useEffect(() => {
        if (footprintHistory.length > 0) {
            generateForecast();
        }
    }, [footprintHistory, timeframe]);

    const generateForecast = () => {
        // Get the last n days of data
        const historicalData = footprintHistory.slice(0, parseInt(timeframe));
        
        // Calculate average daily emissions
        const avgDailyEmissions = historicalData.reduce((sum, day) => 
            sum + day.carbonFootprint, 0) / historicalData.length;

        // Calculate trend (simple linear regression)
        const xValues = historicalData.map((_, i) => i);
        const yValues = historicalData.map(day => day.carbonFootprint);
        
        const n = xValues.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Generate forecast for next 30 days
        const forecast = [];
        const lastDate = new Date(historicalData[0].date);
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + i + 1);
            
            const predictedValue = slope * (n + i) + intercept;
            forecast.push({
                date: date.toISOString(),
                carbonFootprint: Math.max(0, predictedValue), // Ensure non-negative
                type: 'forecast'
            });
        }

        // Combine historical and forecast data
        const combinedData = [
            ...historicalData.map(day => ({ ...day, type: 'historical' })),
            ...forecast
        ];

        setForecastData(combinedData);
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Predictive Analytics</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setTimeframe('30')}
                        className={`px-4 py-2 rounded ${
                            timeframe === '30'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setTimeframe('60')}
                        className={`px-4 py-2 rounded ${
                            timeframe === '60'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        60 Days
                    </button>
                    <button
                        onClick={() => setTimeframe('90')}
                        className={`px-4 py-2 rounded ${
                            timeframe === '90'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="carbonFootprint" 
                            stroke="#3b82f6" 
                            name="Carbon Footprint"
                            dot={false}
                            strokeDasharray={d => d.type === 'forecast' ? '5 5' : 'none'}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Trend Analysis</h3>
                    <p className="text-gray-600">
                        Based on your {timeframe}-day history, your carbon footprint is 
                        {forecastData.length > 0 && forecastData[forecastData.length - 1].carbonFootprint > forecastData[0].carbonFootprint 
                            ? ' increasing' 
                            : ' decreasing'}.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">30-Day Forecast</h3>
                    <p className="text-gray-600">
                        Projected emissions: {forecastData.length > 0 
                            ? `${forecastData[forecastData.length - 1].carbonFootprint.toFixed(2)} kg CO₂` 
                            : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics; 