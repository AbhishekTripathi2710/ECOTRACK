import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { logAuthInfo } from "../utils/authDebug";
import { requestOTP, verifyOTP } from "../services/authService";

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email input, 2: OTP input
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    async function handleRequestOTP(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await requestOTP(email);
            if (response.success) {
                setStep(2);
            }
        } catch (err) {
            console.error('OTP request error:', err);
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await verifyOTP(email, otp);
            if (response.success) {
                // Log auth status before login
                console.log('Authentication status before login:');
                logAuthInfo();
                
                // Login with token and user data
                await login(response.data.token, response.data.user);
                
                // Log auth status after login
                console.log('Authentication status after login:');
                logAuthInfo();
                
                // Navigate to home page
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-500 text-white rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                            disabled={step === 2}
                        />
                    </div>
                    {step === 2 && (
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2" htmlFor="otp">OTP</label>
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                type="text"
                                id="otp"
                                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter OTP"
                                required
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {step === 1 ? 'Requesting OTP...' : 'Verifying OTP...'}
                            </span>
                        ) : (
                            step === 1 ? 'Request OTP' : 'Verify OTP'
                        )}
                    </button>
                </form>
                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="mt-4 text-blue-500 hover:text-blue-400"
                    >
                        Back to email
                    </button>
                )}
                <p className="text-gray-400 mt-4">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;