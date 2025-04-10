import React from "react";
import { Route, Routes } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CarbonCalculator from "../pages/CarbonCalculator";
import About from "../pages/About";
import Analytics from '../pages/Analytics';
import Community from '../components/Community';
import Contests from '../pages/Contests';
import Profile from "../pages/Profile";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Login />;
    }
    
    return children;
};

const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calculator" element={<ProtectedRoute><CarbonCalculator /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
    )
}

export default AppRoutes;