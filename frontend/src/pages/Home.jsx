import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Hero Section */}
            <header className="text-center py-16 px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-green-400">Calculate Your Carbon Footprint</h1>
                <p className="text-lg mt-4 text-gray-300">Take a step towards a greener future by tracking and reducing your carbon emissions.</p>
                <Link to="/calculator">
                    <button className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-lg font-semibold">
                        Get Started
                    </button>
                </Link>
            </header>

            {/* Why It Matters Section */}
            <section className="max-w-4xl mx-auto text-center py-12 px-6">
                <h2 className="text-3xl font-semibold text-green-400">Why It Matters?</h2>
                <p className="mt-4 text-gray-300">
                    Every action we take impacts the environment. Reducing carbon emissions helps combat climate change,
                    preserve resources, and create a sustainable future.
                </p>
                <div className="flex justify-center gap-6 mt-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-64">
                        <h3 className="text-xl font-semibold text-green-400">🌱 4.8 Metric Tons</h3>
                        <p className="text-gray-300 text-sm">The average carbon footprint per person annually.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-64">
                        <h3 className="text-xl font-semibold text-green-400">🌎 40 Trees</h3>
                        <p className="text-gray-300 text-sm">Reducing 1 ton of CO₂ is like planting 40 trees.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="max-w-4xl mx-auto py-12 px-6">
                <h2 className="text-3xl font-semibold text-green-400 text-center">How It Works?</h2>
                <div className="mt-6 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-400">1️⃣ Enter Your Daily Activities</h3>
                        <p className="text-gray-300">Provide details about your transport, energy usage, and food habits.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-400">2️⃣ Get Your Carbon Score</h3>
                        <p className="text-gray-300">Our system calculates your footprint and provides insights.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-400">3️⃣ Reduce & Track Impact</h3>
                        <p className="text-gray-300">Learn eco-friendly tips and track your improvements.</p>
                    </div>
                </div>
            </section>

            {/* Mini Calculator Preview (Placeholder) */}
            <section className="max-w-4xl mx-auto text-center py-12 px-6">
                <h2 className="text-3xl font-semibold text-green-400">Try Our Carbon Calculator</h2>
                <p className="mt-4 text-gray-300">Enter a few details to get a quick carbon footprint estimate.</p>
                <Link to="/calculator">
                    <button className="mt-6 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold">
                        Try Now
                    </button>
                </Link>
            </section>

            {/* Leaderboard (Optional) */}
            <section className="max-w-4xl mx-auto text-center py-12 px-6">
                <h2 className="text-3xl font-semibold text-green-400">🌍 Community Impact</h2>
                <p className="mt-4 text-gray-300">Join thousands of users who are reducing their carbon footprint!</p>
                <Link to="/leaderboard">
                    <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg text-lg font-semibold">
                        View Leaderboard
                    </button>
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 py-6 text-center mt-12">
                <p className="text-gray-400">© 2024 Carbon Footprint Calculator | All Rights Reserved</p>
                <div className="mt-2">
                    <a href="#" className="text-gray-400 hover:text-white mx-2">Twitter</a> |
                    <a href="#" className="text-gray-400 hover:text-white mx-2">LinkedIn</a> |
                    <a href="#" className="text-gray-400 hover:text-white mx-2">GitHub</a>
                </div>
            </footer>
        </div>
    );
};

export default Home;
