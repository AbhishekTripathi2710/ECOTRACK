import React, { useState } from 'react';
import { useCarbonFootprint } from '../context/carbonFootprintContext';

const CarbonReductionRoadmap = () => {
    const { currentFootprint, loading, error } = useCarbonFootprint();
    const [selectedGoal, setSelectedGoal] = useState('short-term');

    const generateRoadmap = () => {
        if (!currentFootprint) return [];

        const totalFootprint = Object.values(currentFootprint).reduce((sum, category) => {
            if (typeof category === 'object') {
                return sum + Object.values(category).reduce((catSum, val) => catSum + (val || 0), 0);
            }
            return sum + (category || 0);
        }, 0);

        const shortTermGoal = totalFootprint * 0.8; // 20% reduction
        const mediumTermGoal = totalFootprint * 0.6; // 40% reduction
        const longTermGoal = totalFootprint * 0.4; // 60% reduction

        return [
            {
                period: 'Short-term (1-3 months)',
                target: shortTermGoal,
                steps: [
                    {
                        title: 'Transportation',
                        actions: [
                            'Use public transport 2-3 times per week',
                            'Carpool for work or school',
                            'Maintain proper tire pressure'
                        ],
                        potentialReduction: '15-20%'
                    },
                    {
                        title: 'Energy',
                        actions: [
                            'Switch to LED bulbs',
                            'Unplug unused electronics',
                            'Set thermostat 2°C lower in winter'
                        ],
                        potentialReduction: '10-15%'
                    }
                ]
            },
            {
                period: 'Medium-term (3-6 months)',
                target: mediumTermGoal,
                steps: [
                    {
                        title: 'Food',
                        actions: [
                            'Reduce meat consumption by 30%',
                            'Buy local produce',
                            'Start composting'
                        ],
                        potentialReduction: '20-25%'
                    },
                    {
                        title: 'Waste',
                        actions: [
                            'Implement zero-waste practices',
                            'Start recycling program',
                            'Reduce single-use plastics'
                        ],
                        potentialReduction: '15-20%'
                    }
                ]
            },
            {
                period: 'Long-term (6-12 months)',
                target: longTermGoal,
                steps: [
                    {
                        title: 'Energy',
                        actions: [
                            'Install solar panels',
                            'Upgrade to energy-efficient appliances',
                            'Implement smart home technology'
                        ],
                        potentialReduction: '30-40%'
                    },
                    {
                        title: 'Lifestyle',
                        actions: [
                            'Adopt a plant-based diet',
                            'Use electric or hybrid vehicle',
                            'Implement rainwater harvesting'
                        ],
                        potentialReduction: '25-30%'
                    }
                ]
            }
        ];
    };

    const roadmap = generateRoadmap();
    const selectedRoadmap = roadmap.find(r => r.period.toLowerCase().includes(selectedGoal));

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Carbon Reduction Roadmap</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setSelectedGoal('short-term')}
                        className={`px-4 py-2 rounded ${
                            selectedGoal === 'short-term'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Short-term
                    </button>
                    <button
                        onClick={() => setSelectedGoal('medium-term')}
                        className={`px-4 py-2 rounded ${
                            selectedGoal === 'medium-term'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Medium-term
                    </button>
                    <button
                        onClick={() => setSelectedGoal('long-term')}
                        className={`px-4 py-2 rounded ${
                            selectedGoal === 'long-term'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Long-term
                    </button>
                </div>
            </div>

            {selectedRoadmap && (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800">{selectedRoadmap.period}</h3>
                        <p className="text-blue-600">
                            Target: {selectedRoadmap.target.toFixed(2)} kg CO₂ per day
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedRoadmap.steps.map((step, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">{step.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Potential reduction: {step.potentialReduction}
                                </p>
                                <ul className="space-y-2">
                                    {step.actions.map((action, actionIndex) => (
                                        <li key={actionIndex} className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span className="text-gray-700">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800">Progress Tracking</h3>
                        <p className="text-green-600">
                            Track your progress daily and adjust your actions based on results.
                            Remember that small changes can lead to significant reductions over time.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarbonReductionRoadmap; 