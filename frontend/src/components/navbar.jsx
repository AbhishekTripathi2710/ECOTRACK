"use client"

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className={`shadow-lg ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://media.istockphoto.com/id/1401304047/vector/reduce-your-carbon-footprint-logo-net-zero-emission.jpg?s=612x612&w=0&k=20&c=xub0yqSnVW4NN827DP0k7VPy5Gc3SSZ-4PbgITJbKVo="
              alt="Logo"
              className="h-12 w-auto"
            />
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="hover:text-green-600 px-3 py-2 text-sm font-medium">
              DASHBOARD
            </Link>
            <Link to="/" className="hover:text-green-600 px-3 py-2 text-sm font-medium">
              ABOUT US
            </Link>
            <button
              onClick={() => navigate("/calculator")}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              CALCULATE FOOTPRINT
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:text-green-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <Link to="/what-we-do" className="block px-3 py-2 text-base font-medium hover:text-green-600">
            WHAT WE DO
          </Link>
          <Link to="/about" className="block px-3 py-2 text-base font-medium hover:text-green-600">
            ABOUT US
          </Link>
          <Link to="/get-involved" className="block px-3 py-2 text-base font-medium hover:text-green-600">
            GET INVOLVED
          </Link>
          <Link to="/membership" className="block px-3 py-2 text-base font-medium hover:text-green-600">
            MEMBERSHIP & GIVING
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="block w-full px-4 py-2 text-center rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
