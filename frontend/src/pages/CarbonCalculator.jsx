"use client"

import { useContext, useEffect, useState } from "react"
import StepWizard from "react-step-wizard"
import { UserContext } from "../context/userContext"
import { useNavigate } from "react-router-dom"
import axios from "../config/axios"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"
import { motion } from "framer-motion" // For smooth animations

const CarbonCalculator = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    electricityBill: "",
    gasType: "",
    pngBill: "",
    lpgCylinders: "",
    transportation: "",
    vehicleType: "",
    distance: "",
    foodConsumption: "",
    diet: "",
  })

  const [carbonFootprint, setCarbonFootprint] = useState(0.0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const updateFormData = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    try {
      let gasBill = 0
      let lpgCylinders = 0
      if (formData.gasType === "PNG") gasBill = formData.pngBill
      if (formData.gasType === "LPG") lpgCylinders = formData.lpgCylinders

      const requestData = {
        energy: {
          electricityBill: formData.electricityBill / 30,
          gasBill: gasBill / 30,
          gasType: formData.gasType,
          lpgCylinders: lpgCylinders,
        },
        transportation: {
          [formData.vehicleType]: formData.distance,
        },
        foodConsumption: formData.foodConsumption, // Now in calories
        diet: formData.diet,
      }

      const response = await axios.post("/api/carbon/submit", requestData)
      if (response.data.dailyFootprint !== undefined) {
        setCarbonFootprint(response.data.dailyFootprint)
      } else {
        setError("Unexpected response format")
      }
    } catch (err) {
      setError("Failed to calculate. Please try again.")
    }
  }
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <Navbar />
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Daily Carbon Footprint Quiz</h2>

        <StepWizard>
          <Step1 updateFormData={updateFormData} />
          <GasStep updateFormData={updateFormData} gasType={formData.gasType} />
          <Step2 updateFormData={updateFormData} />
          <Step3 updateFormData={updateFormData} />
          <Step4 updateFormData={updateFormData} handleSubmit={handleSubmit} />
        </StepWizard>

        {carbonFootprint > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-green-600 text-white rounded-lg text-center">
            <h3 className="text-xl font-semibold">Your Daily Carbon Footprint:</h3>
            <p className="text-2xl font-bold">{carbonFootprint} kg CO₂</p>
          </motion.div>
        )}

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
      <Footer />
    </div>
  )
}


const Step1 = ({ updateFormData, nextStep }) => (
  <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-white">
    <h3 className="text-lg font-bold mb-4">Energy Usage</h3>
    <label className="block mb-2">Monthly Electricity Bill (INR)</label>
    <input
      type="number"
      onChange={(e) => updateFormData("electricityBill", e.target.value)}
      className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-400"
      required
    />

    <button onClick={nextStep} className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Next</button>
  </motion.div>
)

const GasStep = ({ updateFormData, nextStep, previousStep, gasType }) => (
  <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-white">
    <h3 className="text-lg font-bold mb-4">Gas Usage</h3>
    <select
      onChange={(e) => updateFormData("gasType", e.target.value)}
      className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Select Gas Type</option>
      <option value="PNG">Piped Natural Gas (PNG)</option>
      <option value="LPG">Liquefied Petroleum Gas (LPG)</option>
    </select>

    {gasType === "PNG" && (
      <div className="mt-4">
        <label className="block mb-2">Monthly PNG Bill (INR)</label>
        <input
          type="number"
          onChange={(e) => updateFormData("pngBill", e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
    )}

    {gasType === "LPG" && (
      <div className="mt-4">
        <label className="block mb-2">Number of LPG Cylinders Used</label>
        <input
          type="number"
          onChange={(e) => updateFormData("lpgCylinders", e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
    )}

    <div className="flex justify-between mt-4">
      <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">Back</button>
      <button onClick={nextStep} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Next</button>
    </div>
  </motion.div>
)

const Step2 = ({ updateFormData, nextStep, previousStep }) => (
  <div className="text-white">
    <h3 className="text-lg font-bold mb-4">Transportation</h3>
    <label className="block mb-2">Vehicle Type</label>
    <select
      onChange={(e) => updateFormData("vehicleType", e.target.value)}
      className="w-full p-2 rounded bg-gray-700 text-white"
    >
      <option value="">Select Vehicle</option>
      <option value="car">Car</option>
      <option value="bike">Bike</option>
      <option value="publicTransport">Public Transport</option>
      <option value="flights">Flights</option>
    </select>

    <label className="block mt-4 mb-2">Daily Distance Travelled (km)</label>
    <input
      type="number"
      onChange={(e) => updateFormData("distance", e.target.value)}
      className="w-full p-2 rounded bg-gray-700 text-white"
      required
    />

    <div className="flex justify-between mt-4">
      <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">
        Back
      </button>
      <button onClick={nextStep} className="p-2 bg-blue-500 text-white rounded">
        Next
      </button>
    </div>
  </div>
)

const Step3 = ({ updateFormData, nextStep, previousStep }) => (
    <div className="text-white">
      <h3 className="text-lg font-bold mb-4">Food Consumption</h3>
      <label className="block mb-2">Daily Food Consumption (calories)</label>
      <input
        type="number"
        onChange={(e) => updateFormData("foodConsumption", e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white"
        required
      />
  
      <label className="block mt-4 mb-2">Diet Type</label>
      <select
        onChange={(e) => updateFormData("diet", e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white"
      >
        <option value="">Select Diet</option>
        <option value="vegan">Vegan</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="non-vegetarian">Non-Vegetarian</option>
      </select>
  
      <div className="flex justify-between mt-4">
        <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">
          Back
        </button>
        <button onClick={nextStep} className="p-2 bg-blue-500 text-white rounded">
          Next
        </button>
      </div>
    </div>
  )

const Step4 = ({ updateFormData, handleSubmit, previousStep }) => (
  <div className="text-white">
    <h3 className="text-lg font-bold mb-4">Review & Calculate</h3>
    <p className="mb-4">Please review your inputs and click Calculate to see your carbon footprint.</p>

    <div className="flex justify-between mt-4">
      <button onClick={previousStep} className="p-2 bg-gray-500 text-white rounded">
        Back
      </button>
      <button onClick={handleSubmit} className="p-2 bg-green-500 text-white rounded">
        Calculate
      </button>
    </div>
  </div>
)

export default CarbonCalculator

