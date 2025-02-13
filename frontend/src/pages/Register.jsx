import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/userContext";

const Register = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function submitHandler(e) {
        e.preventDefault();
        axios.post('/users/register', {
            fullname: { firstname, lastname },
            email,
            password
        }).then((res) => {
            console.log(res.data);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            navigate('/');
        }).catch((err) => {
            console.log(err.response?.data);
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Register</h2>
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="firstname">First Name</label>
                        <input
                            onChange={(e) => setFirstname(e.target.value)}
                            type="text"
                            id="firstname"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your first name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="lastname">Last Name</label>
                        <input
                            onChange={(e) => setLastname(e.target.value)}
                            type="text"
                            id="lastname"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your last name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>
                <p className="text-gray-400 mt-4">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
