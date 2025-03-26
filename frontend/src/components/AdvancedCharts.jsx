import React, { useState } from 'react';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { format } from 'date-fns';

const AdvancedCharts = () => {
    const { footprintHistory, monthlyData, loading, error } = useCarbonFootprint();
    const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');

    // Process data for visualization
    const processedData = selectedTimeframe === 'monthly' ? monthlyData : footprintHistory;

    // Format data for Recharts
    const chartData = processedData.map(item => ({
        date: format(new Date(item.date), 'MMM dd, yyyy'),
        carbonFootprint: item.carbonFootprint,
        transportation: item.transportation,
        energy: item.energy,
        waste: item.waste,
        food: item.food
    }));

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Carbon Footprint Analysis</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setSelectedTimeframe('monthly')}
                        className={`px-4 py-2 rounded ${
                            selectedTimeframe === 'monthly'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setSelectedTimeframe('daily')}
                        className={`px-4 py-2 rounded ${
                            selectedTimeframe === 'daily'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Daily
                    </button>
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="carbonFootprint"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorCarbon)"
                            name="Carbon Footprint"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Total Emissions</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {processedData.reduce((sum, d) => sum + d.carbonFootprint, 0).toFixed(2)} kg CO2
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Average Daily</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {(processedData.reduce((sum, d) => sum + d.carbonFootprint, 0) / processedData.length).toFixed(2)} kg CO2
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Peak Emission</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {Math.max(...processedData.map(d => d.carbonFootprint)).toFixed(2)} kg CO2
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCharts; 