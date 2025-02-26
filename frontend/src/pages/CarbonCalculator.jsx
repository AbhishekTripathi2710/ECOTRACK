import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";

const CarbonCalculator = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        electricityBill: "",
        gasBill: "",
        transportation: "",
        vehicleType:"",
        distance:"",
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
    
        try {
            const requestData = {
                energy: {
                    electricityBill: formData.electricityBill / 30,  // Convert monthly to daily
                    gasBill: formData.gasBill / 30,  // Convert monthly to daily
                    gasType: formData.gasType,
                },
                transportation: {
                    [formData.vehicleType]: formData.distance,
                },  // Assuming it's daily
                foodConsumption: formData.foodConsumption,  // Assuming it's daily
                diet: formData.diet,
            };
    
            const response = await axios.post("/api/carbon/submit", requestData);
    
            console.log("API Response:", response.data);  // Debugging
            console.log(response.data.dailyFootprint)
    
            if (response.data.dailyFootprint !== undefined) {
                setCarbonFootprint(response.data.dailyFootprint);  // ✅ Correct field
            } else {
                setError("Unexpected response format");
            }
        } catch (err) {
            setError("Failed to calculate. Please try again.");
        }
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Daily Carbon Footprint Calculator</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Monthly Electricity Bill (INR)</label>
                        <input
                            type="number"
                            name="electricityBill"
                            value={formData.electricityBill}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Monthly Gas Bill (INR)</label>
                        <input
                            type="number"
                            name="gasBill"
                            value={formData.gasBill}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Vehicle</option>
                            <option value="car">Car</option>
                            <option value="bike">Bike</option>
                            <option value="publicTransport">Public Transport</option>
                            <option value="flights">Flights</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Daily Distance Travelled (km)</label>
                        <input
                            type="number"
                            name="distance"
                            value={formData.distance}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Daily Food Consumption (kg)</label>
                        <input
                            type="number"
                            name="foodConsumption"
                            value={formData.foodConsumption}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Diet Type</label>
                        <select
                            name="diet"
                            value={formData.diet}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Diet</option>
                            <option value="vegan">Vegan</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="non-vegetarian">Non-Vegetarian</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Gas Type</label>
                        <select
                            name="gasType"
                            value={formData.gasType}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Gas Type</option>
                            <option value="PNG">Piped Natural Gas (PNG)</option>
                            <option value="LPG">Liquefied Petroleum Gas (LPG)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                    >
                        Calculate
                    </button>
                </form>

                {carbonFootprint !== null && (
                    <div className="mt-6 p-4 bg-gray-700 rounded text-white">
                        <h3 className="text-lg font-semibold">Your Daily Carbon Footprint:</h3>
                        <p className="text-xl font-bold">{carbonFootprint} kg CO₂</p>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 mt-4">{error}</p>
                )}
            </div>
        </div>
    );
};

export default CarbonCalculator;
