import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../config/axios';
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
import { FaChartLine, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

// Create a separate axios instance for ML service
const mlAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_ML_SERVICE_URL
});

const MLPredictions = ({ monthlyData }) => {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testData, setTestData] = useState(null);

    const fetchPredictions = async (data) => {
        try {
            setLoading(true);
            const response = await mlAxiosInstance.post('/predictions', {
                historicalData: data
            });
            setPredictions(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch predictions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                const response = await mlAxiosInstance.get('/test-data');
                setTestData(response.data);
            } catch (err) {
                console.error('Error fetching test data:', err);
                setError('Failed to fetch test data. Please try again later.');
            }
        };

        // If we have real data, use it; otherwise, fetch test data
        if (monthlyData && monthlyData.length >= 30) {
            fetchPredictions(monthlyData);
        } else {
            fetchTestData();
        }
    }, [monthlyData]);

    useEffect(() => {
        if (testData) {
            fetchPredictions(testData);
        }
    }, [testData]);

    if (loading) return <div className="text-center py-4 text-gray-300">Loading predictions...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    if (!predictions) return null;

    // Combine historical and forecast data for the chart
    const chartData = [
        ...(testData || monthlyData).map(day => ({
            date: new Date(day.date).toISOString(),
            carbonFootprint: day.carbonFootprint,
            type: 'historical'
        })),
        ...predictions.forecastData.map(day => ({
            date: day.date,
            carbonFootprint: day.predicted,
            type: 'forecast'
        }))
    ];

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            {testData && (
                <div className="mb-4 p-4 bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-400 flex items-center gap-2">
                        <FaExclamationTriangle />
                        Using sample data for demonstration. Add your own data through the carbon calculator for personalized insights.
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">Carbon Footprint Forecast</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                    stroke="#9CA3AF"
                                />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip 
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#9CA3AF' }}
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
                </div>

                {/* Insights */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">AI Insights</h3>
                    <ul className="space-y-2">
                        {predictions.insights.map((insight, index) => (
                            <li key={index} className="text-gray-300 flex items-start">
                                <span className="text-blue-400 mr-2">•</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                        {predictions.recommendations.map((rec, index) => (
                            <li key={index} className="text-gray-300 flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Anomalies */}
                {predictions.anomalies.length > 0 && (
                    <div className="col-span-2 bg-red-900/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">Detected Anomalies</h3>
                        <ul className="space-y-2">
                            {predictions.anomalies.map((anomaly, index) => (
                                <li key={index} className="text-gray-300">
                                    <span className="text-red-400">⚠</span> {anomaly.date}: {anomaly.value} kg CO₂
                                    <br />
                                    <span className="text-sm text-gray-400">
                                        Expected range: {anomaly.expected_range} kg CO₂
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MLPredictions; 