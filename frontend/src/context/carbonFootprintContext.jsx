import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { useUser } from './userContext';

const CarbonFootprintContext = createContext();

export const CarbonFootprintProvider = ({ children }) => {
    const { user } = useUser();
    const [currentFootprint, setCurrentFootprint] = useState(null);
    const [footprintHistory, setFootprintHistory] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch current footprint
    const fetchCurrentFootprint = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/carbon/user-data');
            setCurrentFootprint(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching current footprint');
        } finally {
            setLoading(false);
        }
    };

    // Fetch footprint history
    const fetchFootprintHistory = async (period = 30) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/carbon/history');
            setFootprintHistory(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching footprint history');
        } finally {
            setLoading(false);
        }
    };

    // Fetch monthly data
    const fetchMonthlyData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/carbon/monthly');
            setMonthlyData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching monthly data');
        } finally {
            setLoading(false);
        }
    };

    // Create new footprint
    const createFootprint = async (footprintData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/carbon/submit', footprintData);
            setCurrentFootprint(response.data.data);
            // Refresh both history and monthly data after creating a new footprint
            await Promise.all([
                fetchFootprintHistory(),
                fetchMonthlyData()
            ]);
            return response.data.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Error creating footprint');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (user) {
            Promise.all([
                fetchCurrentFootprint(),
                fetchFootprintHistory(),
                fetchMonthlyData()
            ]);
        }
    }, [user]);

    const value = {
        currentFootprint,
        footprintHistory,
        monthlyData,
        loading,
        error,
        fetchCurrentFootprint,
        fetchFootprintHistory,
        fetchMonthlyData,
        createFootprint
    };

    return (
        <CarbonFootprintContext.Provider value={value}>
            {children}
        </CarbonFootprintContext.Provider>
    );
};

export const useCarbonFootprint = () => {
    const context = useContext(CarbonFootprintContext);
    if (!context) {
        throw new Error('useCarbonFootprint must be used within a CarbonFootprintProvider');
    }
    return context;
}; 