import React, { useEffect } from 'react';
import AdvancedCharts from '../components/AdvancedCharts';
import ComparativeAnalysis from '../components/ComparativeAnalysis';
import PredictiveAnalytics from '../components/PredictiveAnalytics';
import IndustryBenchmarks from '../components/IndustryBenchmarks';
import CarbonReductionRoadmap from '../components/CarbonReductionRoadmap';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import Navbar from '../components/navbar';

const Analytics = () => {
    const { loading, error, currentFootprint } = useCarbonFootprint();

    // Only log when currentFootprint changes and is not null
    useEffect(() => {
        if (currentFootprint) {
            console.log('Current Footprint Data:', currentFootprint);
        }
    }, [currentFootprint]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-xl text-gray-300">Loading analytics...</div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-xl text-red-500">{error}</div>
        </div>
    );

    // Calculate total emissions from all categories
    const totalEmissions = currentFootprint ? 
        Object.values(currentFootprint).reduce((sum, value) => 
            typeof value === 'number' ? sum + value : sum, 0) : 0;

    // Calculate monthly average (assuming we have 12 months of data)
    const monthlyAverage = totalEmissions / 12;

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <Navbar></Navbar>
                {/* <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Carbon Footprint Analytics</h1>
                    <p className="text-gray-400">Track and analyze your carbon emissions across different categories</p>
                </div> */}
                <br></br>
                <br></br>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Current Footprint</h3>
                        <p className="text-3xl font-bold text-blue-400">
                            {totalEmissions.toFixed(2)} kg CO2
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Monthly Average</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {monthlyAverage.toFixed(2)} kg CO2
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Reduction Target</h3>
                        <p className="text-3xl font-bold text-purple-400">
                            20%
                        </p>
                    </div>
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <AdvancedCharts />
                    </div>
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <ComparativeAnalysis />
                    </div>
                </div>

                {/* Predictive Analytics Section */}
                <div className="mb-8">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <PredictiveAnalytics />
                    </div>
                </div>

                {/* Industry Benchmarks and Roadmap Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <IndustryBenchmarks />
                    </div>
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <CarbonReductionRoadmap />
                    </div>
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Key Insights</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Track your carbon footprint over time</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Compare different emission sources</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Identify trends and patterns</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Set reduction goals</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Focus on high-impact areas</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Track progress over time</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Next Steps</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Create reduction strategies</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Share with your community</span>
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                <span className="text-gray-300">Celebrate achievements</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics; 