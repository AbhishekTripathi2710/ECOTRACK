import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await axiosInstance.get('/api/users/me');
                    setUser(response.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Authentication error');
                localStorage.removeItem('authToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login user
    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/users/login', { email, password });
            const { token, user } = response.data.data;
            
            // Debug
            console.log('Login successful, token received (first 20 chars):', token.substring(0, 20) + '...');
            
            // Ensure token has proper format
            const formattedToken = token.startsWith('Bearer ') ? token : token;
            localStorage.setItem('authToken', formattedToken);
            
            console.log('Token stored in localStorage, format check:', {
                startsWithBearer: formattedToken.startsWith('Bearer '),
                length: formattedToken.length
            });
            
            setUser(user);
            return user;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/users/register', userData);
            const { token, user } = response.data.data;
            
            // Debug
            console.log('Registration successful, token received (first 20 chars):', token.substring(0, 20) + '...');
            
            // Ensure token has proper format
            const formattedToken = token.startsWith('Bearer ') ? token : token;
            localStorage.setItem('authToken', formattedToken);
            
            console.log('Token stored in localStorage, format check:', {
                startsWithBearer: formattedToken.startsWith('Bearer '),
                length: formattedToken.length
            });
            
            setUser(user);
            return user;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setError(null);
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.put('/api/users/profile', userData);
            setUser(response.data.data);
            return response.data.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Profile update failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};