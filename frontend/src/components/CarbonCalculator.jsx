/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
// Suppress defaultProps warning from react-step-wizard
/* eslint-disable react/default-props-match-prop-types */

import React, { useState } from 'react';
import { useCarbonFootprint } from '../context/carbonFootprintContext';
import { useNotification } from '../context/NotificationContext';
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
import {
    FaCar,
    FaBus,
    FaTrain,
    FaPlane,
    FaLightbulb,
    FaFire,
    FaWater,
    FaUtensils,
    FaShoppingBag,
    FaRecycle
} from 'react-icons/fa';

const CarbonCalculator = () => {
    const {
        currentFootprint,
        footprintHistory,
        recommendations,
        leaderboard,
        createFootprint,
        updateFootprint,
        setCarbonGoal,
        loading,
        error
    } = useCarbonFootprint();
    const { addNotification } = useNotification();

    const [activeTab, setActiveTab] = useState('calculator');
    const [formData, setFormData] = useState({
        transportation: {
            car: 0,
            bike: 0,
            publicTransport: 0,
            flights: 0
        },
        energy: {
            electricityBill: 0,
            gasBill: 0,
            lpgCylinders: 0,
            gasType: "PNG",
            renewableUsage: false
        },
        diet: "non-vegetarian",
        food: {
            calories: 2000
        }
    });

    const [goalData, setGoalData] = useState({
        target: 0,
        deadline: ''
    });

    const handleInputChange = (category, subcategory, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [subcategory]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createFootprint(formData);
            // Reset form after successful submission
            setFormData({
                transportation: {
                    car: 0,
                    bike: 0,
                    publicTransport: 0,
                    flights: 0
                },
                energy: {
                    electricityBill: 0,
                    gasBill: 0,
                    lpgCylinders: 0,
                    gasType: "PNG",
                    renewableUsage: false
                },
                diet: "non-vegetarian",
                food: {
                    calories: 2000
                }
            });

            // Award points and check achievements
            const pointsResponse = await awardFootprintPoints(userId);
            console.log('Points response:', pointsResponse);

            if (pointsResponse.success) {
                // Check for achievements
                const achievementsResponse = await checkAchievements(userId, carbonReduction, carbonData);
                console.log('Achievements response:', achievementsResponse);

                if (achievementsResponse.success && achievementsResponse.data.newAchievements.length > 0) {
                    achievementsResponse.data.newAchievements.forEach(achievement => {
                        addNotification(`Unlocked: ${achievement.name} - ${achievement.description}`, 'achievement');
                    });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to calculate carbon footprint. Please try again.');
        }
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            await setCarbonGoal(goalData);
            setGoalData({ target: 0, deadline: '' });
        } catch (err) {
            console.error('Error setting goal:', err);
        }
    };

    const renderCalculator = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Calculate Your Carbon Footprint</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transportation Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FaCar className="mr-2" /> Transportation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Car Distance (km)</label>
                            <input
                                type="number"
                                value={formData.transportation.car}
                                onChange={(e) => handleInputChange('transportation', 'car', 'distance', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bike Distance (km)</label>
                            <input
                                type="number"
                                value={formData.transportation.bike}
                                onChange={(e) => handleInputChange('transportation', 'bike', 'distance', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Energy Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FaLightbulb className="mr-2" /> Energy Consumption
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Electricity Bill (kWh)</label>
                            <input
                                type="number"
                                value={formData.energy.electricityBill}
                                onChange={(e) => handleInputChange('energy', 'electricityBill', 'consumption', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gas Bill (m³)</label>
                            <input
                                type="number"
                                value={formData.energy.gasBill}
                                onChange={(e) => handleInputChange('energy', 'gasBill', 'consumption', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Food Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FaUtensils className="mr-2" /> Food Consumption
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Diet Type</label>
                            <select
                                value={formData.diet}
                                onChange={(e) => handleInputChange('diet', 'dietType', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            >
                                <option value="vegan">Vegan</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="omnivore">Omnivore</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Calories</label>
                            <input
                                type="number"
                                value={formData.food.calories}
                                onChange={(e) => handleInputChange('food', 'calories', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Calculate Footprint
                </button>
            </form>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Carbon Footprint History</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={footprintHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="totalEmissions"
                            stroke="#10B981"
                            name="Total Emissions"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const renderRecommendations = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-2">{rec.category}</h3>
                        <p className="text-gray-600 mb-4">{rec.message}</p>
                        <div className="text-green-600 font-medium">
                            Potential Reduction: {rec.potentialReduction}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Community Leaderboard</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="space-y-4">
                    {leaderboard.map((user, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center">
                                <span className="text-xl font-bold mr-4">{index + 1}</span>
                                <span className="font-medium">{user.name}</span>
                            </div>
                            <span className="text-green-600 font-medium">
                                {user.totalEmissions.toFixed(2)} kg CO₂
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGoals = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Set Carbon Reduction Goals</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleGoalSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Target Reduction (kg CO₂)
                        </label>
                        <input
                            type="number"
                            value={goalData.target}
                            onChange={(e) => setGoalData({ ...goalData, target: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={goalData.deadline}
                            onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Set Goal
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('calculator')}
                    className={`px-4 py-2 rounded-md ${
                        activeTab === 'calculator'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Calculator
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-md ${
                        activeTab === 'history'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-4 py-2 rounded-md ${
                        activeTab === 'recommendations'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Recommendations
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-4 py-2 rounded-md ${
                        activeTab === 'leaderboard'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Leaderboard
                </button>
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`px-4 py-2 rounded-md ${
                        activeTab === 'goals'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Goals
                </button>
            </div>

            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-red-600 text-center">{error}</div>}

            {activeTab === 'calculator' && renderCalculator()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'recommendations' && renderRecommendations()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
            {activeTab === 'goals' && renderGoals()}
        </div>
    );
};

export default CarbonCalculator; 