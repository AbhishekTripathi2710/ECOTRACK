import React, { useContext, useEffect, useState } from "react";
import StepWizard from "react-step-wizard";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const CarbonCalculator = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        electricityBill: "",
        gasBill: "",
        transportation: "",
        vehicleType: "",
        distance: "",
        foodConsumption: "",
        diet: "",
        gasType: ""
    });

    const [carbonFootprint, setCarbonFootprint] = useState(0.0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const updateFormData = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);

        try {
            const requestData = {
                energy: {
                    electricityBill: formData.electricityBill / 30, // Convert monthly to daily
                    gasBill: formData.gasBill / 30, // Convert monthly to daily
                    gasType: formData.gasType
                },
                transportation: {
                    [formData.vehicleType]: formData.distance
                },
                foodConsumption: formData.foodConsumption,
                diet: formData.diet
            };

            const response = await axios.post("/api/carbon/submit", requestData);

            if (response.data.dailyFootprint !== undefined) {
                setCarbonFootprint(response.data.dailyFootprint);
            } else {
                setError("Unexpected response format");
            }
        } catch (err) {
            setError("Failed to calculate. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <Navbar />
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto mt-10">
                <h2 className="text-2xl font-bold text-white mb-6">Daily Carbon Footprint Quiz</h2>

                <StepWizard>
                    <Step1 updateFormData={updateFormData} />
                    <Step2 updateFormData={updateFormData} />
                    <Step3 updateFormData={updateFormData} />
                    <Step4 updateFormData={updateFormData} handleSubmit={handleSubmit} />
                </StepWizard>

                {carbonFootprint > 0 && (
                    <div className="mt-6 p-4 bg-gray-700 rounded text-white">
                        <h3 className="text-lg font-semibold">Your Daily Carbon Footprint:</h3>
                        <p className="text-xl font-bold">{carbonFootprint} kg CO₂</p>
                    </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
            <Footer />
        </div>
    );
};

// Individual Steps
const Step1 = ({ updateFormData, nextStep }) => (
    <div className="text-white">
        <h3 className="text-lg font-bold mb-4">Energy Usage</h3>
        <label className="block mb-2">Monthly Electricity Bill (INR)</label>
        <input type="number" onChange={(e) => updateFormData("electricityBill", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
        
        <label className="block mt-4 mb-2">Monthly Gas Bill (INR)</label>
        <input type="number" onChange={(e) => updateFormData("gasBill", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />

        <button onClick={nextStep} className="mt-4 p-2 bg-blue-500 text-white rounded">Next</button>
    </div>
);

const Step2 = ({ updateFormData, nextStep, previousStep }) => (
    <div className="text-white">
        <h3 className="text-lg font-bold mb-4">Transportation</h3>
        <label className="block mb-2">Vehicle Type</label>
        <select onChange={(e) => updateFormData("vehicleType", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
            <option value="">Select Vehicle</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="publicTransport">Public Transport</option>
            <option value="flights">Flights</option>
        </select>

        <label className="block mt-4 mb-2">Daily Distance Travelled (km)</label>
        <input type="number" onChange={(e) => updateFormData("distance", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />

        <div className="flex justify-between mt-4">
            <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">Back</button>
            <button onClick={nextStep} className="p-2 bg-blue-500 text-white rounded">Next</button>
        </div>
    </div>
);

const Step3 = ({ updateFormData, nextStep, previousStep }) => (
    <div className="text-white">
        <h3 className="text-lg font-bold mb-4">Food Consumption</h3>
        <label className="block mb-2">Daily Food Consumption (kg)</label>
        <input type="number" onChange={(e) => updateFormData("foodConsumption", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />

        <label className="block mt-4 mb-2">Diet Type</label>
        <select onChange={(e) => updateFormData("diet", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
            <option value="">Select Diet</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
        </select>

        <div className="flex justify-between mt-4">
            <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">Back</button>
            <button onClick={nextStep} className="p-2 bg-blue-500 text-white rounded">Next</button>
        </div>
    </div>
);

const Step4 = ({ updateFormData, handleSubmit, previousStep }) => (
    <div className="text-white">
        <h3 className="text-lg font-bold mb-4">Gas Usage</h3>
        <label className="block mb-2">Gas Type</label>
        <select onChange={(e) => updateFormData("gasType", e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
            <option value="">Select Gas Type</option>
            <option value="PNG">Piped Natural Gas (PNG)</option>
            <option value="LPG">Liquefied Petroleum Gas (LPG)</option>
        </select>

        <div className="flex justify-between mt-4">
            <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">Back</button>
            <button onClick={handleSubmit} className="p-2 bg-green-500 text-white rounded">Calculate</button>
        </div>
    </div>
);

export default CarbonCalculator;
