import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AdvancedCharts from '../components/AdvancedCharts';
import ComparativeAnalysis from '../components/ComparativeAnalysis';
import MLPredictions from '../components/MLPredictions';
import IndustryBenchmarks from '../components/IndustryBenchmarks';
import CarbonReductionRoadmap from '../components/CarbonReductionRoadmap';
import CarbonReductionSuggestions from '../components/CarbonReductionSuggestions';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import Navbar from '../components/navbar';
import { FaChartLine, FaChartBar, FaChartArea, FaBrain, FaLeaf } from 'react-icons/fa';

const Analytics = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { currentFootprint, monthlyData, loading, error } = useCarbonFootprint();
    const carbonData = { currentFootprint, monthlyData };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    if (loading) return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <div className="text-2xl text-red-500">{error}</div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

                {/* Current Footprint Summary */}
                {currentFootprint && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
                            <h3 className="text-lg font-semibold text-white mb-2">Today's Footprint</h3>
                            <p className="text-3xl font-bold text-blue-400">{currentFootprint.carbonFootprint.toFixed(2)} kg CO2</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-green-500">
                            <h3 className="text-lg font-semibold text-white mb-2">Weekly Average</h3>
                            <p className="text-3xl font-bold text-green-400">
                                {(monthlyData.slice(-7).reduce((sum, day) => sum + day.carbonFootprint, 0) / 7).toFixed(2)} kg CO2
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
                            <h3 className="text-lg font-semibold text-white mb-2">Monthly Total</h3>
                            <p className="text-3xl font-bold text-purple-400">
                                {monthlyData.reduce((sum, day) => sum + day.carbonFootprint, 0).toFixed(2)} kg CO2
                            </p>
                        </div>
                    </div>
                )}

                {/* Personalized Reduction Suggestions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaLeaf className="text-green-400" />
                        Personalized Suggestions
                    </h2>
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <CarbonReductionSuggestions carbonData={carbonData} />
                    </div>
                </div>

                {/* ML Predictions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaBrain className="text-purple-400" />
                        AI-Powered Insights
                    </h2>
                    <MLPredictions monthlyData={monthlyData} />
                </div>

                {/* Advanced Charts */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaChartLine className="text-blue-400" />
                        Advanced Analytics
                    </h2>
                    <AdvancedCharts />
                </div>

                {/* Comparative Analysis */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaChartBar className="text-green-400" />
                        Comparative Analysis
                    </h2>
                    <ComparativeAnalysis />
                </div>

                {/* Industry Benchmarks */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaChartArea className="text-yellow-400" />
                        Industry Benchmarks
                    </h2>
                    <IndustryBenchmarks />
                </div>

                {/* Carbon Reduction Roadmap */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Carbon Reduction Roadmap</h2>
                    <CarbonReductionRoadmap />
                </div>
            </main>
        </div>
    );
};

export default Analytics; 