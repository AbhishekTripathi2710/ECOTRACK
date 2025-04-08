import React, { useState } from 'react';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ComparativeAnalysis = () => {
    const { monthlyData, loading, error } = useCarbonFootprint();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Process data for visualization
    const categories = ['transportation', 'energy', 'waste', 'food'];
    
    // Calculate total emissions for each category from monthly data
    const processedData = categories.map(category => {
        const total = monthlyData.reduce((sum, month) => {
            // Different handling based on category type
            if (category === 'transportation' && month.transportation) {
                // Sum all transportation values (car, bike, etc.)
                const transportValues = Object.values(month.transportation);
                const transportTotal = transportValues.reduce((subSum, val) => subSum + (Number(val) || 0), 0);
                return sum + transportTotal;
            } else if (category === 'energy' && month.energy) {
                // Sum all energy values
                const energyValues = Object.values(month.energy);
                const energyTotal = energyValues.reduce((subSum, val) => {
                    // Skip non-numeric values like gasType
                    return typeof val === 'number' ? subSum + val : subSum;
                }, 0);
                return sum + energyTotal;
            } else {
                // For other categories or if the expected structure isn't found
                let value = 0;
                
                // Try to get the value based on category
                if (month[category]) {
                    if (typeof month[category] === 'object') {
                        // If it's an object, sum its numeric values
                        value = Object.values(month[category]).reduce((subSum, val) => {
                            return typeof val === 'number' ? subSum + val : subSum;
                        }, 0);
                    } else {
                        // If it's a direct value
                        value = Number(month[category]) || 0;
                    }
                }
                
                return sum + value;
            }
        }, 0);

        return {
            category,
            value: total
        };
    }).filter(item => item.value > 0); // Only include categories with data

    // Calculate total emissions for the summary
    const totalEmissions = processedData.reduce((sum, item) => sum + item.value, 0);

    // Find the largest contributor
    const largestContributor = processedData.length > 0 
        ? processedData.reduce((max, current) => current.value > max.value ? current : max, processedData[0])
        : { category: 'N/A', value: 0 };

    if (loading) return <div className="text-center py-4 text-gray-300">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    
    if (processedData.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Emission Sources Analysis</h2>
                <div className="text-center py-8 text-gray-300">
                    No emission data available. Please calculate your carbon footprint to see analysis.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Emission Sources Analysis</h2>
                <div className="flex space-x-4">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded capitalize ${
                                selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="category" 
                            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                            stroke="#9CA3AF"
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                            formatter={(value) => [`${Number(value).toFixed(2)} kg CO2`, 'Carbon Footprint']}
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Legend />
                        <Bar 
                            dataKey="value" 
                            fill="#3B82F6" 
                            name="Carbon Footprint"
                            fillOpacity={selectedCategory === 'all' ? 1 : 0.3}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Largest Contributor</h3>
                    <p className="text-2xl font-bold text-blue-400 capitalize">
                        {largestContributor.category}
                    </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Total Emissions</h3>
                    <p className="text-2xl font-bold text-green-400">
                        {totalEmissions.toFixed(2)} kg CO2
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComparativeAnalysis; 