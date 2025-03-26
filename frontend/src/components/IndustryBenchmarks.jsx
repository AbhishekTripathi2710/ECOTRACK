import React from 'react';
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

const IndustryBenchmarks = () => {
    const { currentFootprint, loading, error } = useCarbonFootprint();

    // Industry benchmarks (kg CO2 per day)
    const benchmarks = {
        transportation: {
            average: 8.5,
            sustainable: 4.2,
            current: currentFootprint?.transportation ? 
                Object.values(currentFootprint.transportation).reduce((sum, val) => sum + val, 0) : 0
        },
        energy: {
            average: 12.3,
            sustainable: 6.1,
            current: currentFootprint?.energy ? 
                (currentFootprint.energy.electricityBill || 0) + (currentFootprint.energy.gasBill || 0) : 0
        },
        food: {
            average: 6.8,
            sustainable: 3.4,
            current: currentFootprint?.food ? 
                (currentFootprint.food.calories || 0) * 0.5 : 0
        },
        waste: {
            average: 2.4,
            sustainable: 1.2,
            current: currentFootprint?.waste ? 
                (currentFootprint.waste.recycled || 0) + (currentFootprint.waste.landfill || 0) : 0
        }
    };

    const chartData = Object.entries(benchmarks).map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        average: data.average,
        sustainable: data.sustainable,
        current: data.current
    }));

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Industry Benchmarks</h2>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" fill="#3b82f6" name="Your Footprint" />
                        <Bar dataKey="average" fill="#94a3b8" name="Industry Average" />
                        <Bar dataKey="sustainable" fill="#22c55e" name="Sustainable Target" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Performance Summary</h3>
                    <ul className="mt-2 space-y-2">
                        {Object.entries(benchmarks).map(([category, data]) => (
                            <li key={category} className="flex justify-between items-center">
                                <span className="capitalize">{category}:</span>
                                <span className={`font-semibold ${
                                    data.current <= data.sustainable ? 'text-green-600' :
                                    data.current <= data.average ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {data.current.toFixed(1)} kg CO₂
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Recommendations</h3>
                    <ul className="mt-2 space-y-2">
                        {Object.entries(benchmarks).map(([category, data]) => (
                            data.current > data.sustainable && (
                                <li key={category} className="text-gray-600">
                                    • Consider reducing your {category} emissions to meet sustainable targets
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default IndustryBenchmarks; 