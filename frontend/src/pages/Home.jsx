import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../context/userContext"
import axios from "../config/axios"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"

const Home = () => {
    const { user } = useContext(UserContext)
    const [dailyFootprint, setDailyFootprint] = useState(null)
    const [monthlyFootprint, setMonthlyFootprint] = useState(null)
    const [footprintHistory, setFootprintHistory] = useState([])
    const [footprintBreakdown, setFootprintBreakdown] = useState([])

    useEffect(() => {
        if (user) {
            fetchCarbonData()
        }
    }, [user])

    const fetchCarbonData = async () => {
        try {
            // Fetch latest daily footprint
            const dailyResponse = await axios.get("/api/carbon/user-data");
            const dailyData = dailyResponse.data;
            setDailyFootprint(dailyData.totalFootprint || 0);

            // Fetch monthly footprint from backend
            const monthlyResponse = await axios.get("/api/carbon/monthly");
            setMonthlyFootprint(monthlyResponse.data.monthlyFootprint || 0);

            // Fetch footprint history from backend
            const historyResponse = await axios.get("/api/carbon/history");

            // Ensure historyResponse.data is an array before using map()
            const historyData = Array.isArray(historyResponse.data.history) ? historyResponse.data.history : [];

            setFootprintHistory(
                historyData.map(entry => ({
                    date: entry.date?.$date ? new Date(entry.date.$date).toLocaleDateString() : "Unknown",
                    footprint: entry.totalFootprint || 0,
                }))
            );


            // Construct footprint breakdown safely
            const breakdown = [
                { name: "Public Transport", value: dailyData.transportation?.publicTransport || 0 },
                { name: "Car", value: dailyData.transportation?.car || 0 },
                { name: "Bike", value: dailyData.transportation?.bike || 0 },
                { name: "Flights", value: dailyData.transportation?.flights || 0 },
                { name: "Electricity", value: dailyData.energy?.electricityBill || 0 },
                { name: "Gas", value: dailyData.energy?.gasBill || 0 }
            ];
            setFootprintBreakdown(breakdown);
        } catch (error) {
            console.error("Error fetching carbon data:", error);
        }
    };




    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <header className="bg-gray-800 py-6 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-green-400">Carbon Footprint Dashboard</h1>
                    <Link
                        to="/calculator"
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                        Calculate Now
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Daily Footprint Card */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Today's Footprint</h2>
                        <p className="text-4xl font-bold">
                            {dailyFootprint ? `${dailyFootprint.toFixed(2)} kg CO₂` : "Loading..."}
                        </p>
                    </div>

                    {/* Monthly Footprint Card */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">This Month's Footprint</h2>
                        <p className="text-4xl font-bold">
                            {monthlyFootprint ? `${monthlyFootprint.toFixed(2)} kg CO₂` : "Loading..."}
                        </p>
                    </div>
                </div>

                {/* Footprint History Chart */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg chart-container">
                    <h2 className="text-2xl font-semibold text-green-400 mb-4">Your Carbon Footprint History</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={footprintHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                            <Legend />
                            <Line type="monotone" dataKey="footprint" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Footprint Breakdown */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Footprint Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={footprintBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(footprintBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Category Comparison</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={footprintBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-green-400 mb-4">Tips to Reduce Your Footprint</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Use public transportation or carpool when possible</li>
                        <li>Switch to energy-efficient appliances</li>
                        <li>Reduce meat consumption and opt for plant-based meals</li>
                        <li>Recycle and compost to minimize waste</li>
                        <li>Use renewable energy sources like solar panels</li>
                    </ul>
                </div>
            </main>

            <footer className="bg-gray-800 py-6 text-center mt-12">
                <p className="text-gray-400">© 2024 Carbon Footprint Calculator | All Rights Reserved</p>
                <div className="mt-2">
                    <a href="#" className="text-gray-400 hover:text-white mx-2">
                        Twitter
                    </a>{" "}
                    |
                    <a href="#" className="text-gray-400 hover:text-white mx-2">
                        LinkedIn
                    </a>{" "}
                    |
                    <a href="#" className="text-gray-400 hover:text-white mx-2">
                        GitHub
                    </a>
                </div>
            </footer>
        </div>
    )
}

export default Home

