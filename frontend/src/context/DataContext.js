import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSources, getExpenses } from '../api';
import { useAuth } from './AuthContext'; // We need auth to know WHEN to fetch data

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [sources, setSources] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    const fetchData = useCallback(async () => {
        // Don't fetch if the user is not logged in.
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        // Set loading to true only when we start a fetch.
        setLoading(true);
        try {
            // Fetch sources and a wide range of expenses in parallel.
            const [sourcesData, expensesData] = await Promise.all([
                getSources(),
                getExpenses({ dateRange: 3650 }) // Fetch a large range for client-side filtering
            ]);

            setSources(sourcesData);
            setExpenses(expensesData);
            setError(null); // Clear previous errors on a successful fetch
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err.message || "Could not load data.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]); // Re-create this function only if auth status changes

    // Fetch data when the component mounts or when the user logs in/out.
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const value = {
        sources,
        expenses,
        loading,
        error,
        setError, // MODIFICATION: Add setError to the context value
        fetchData // Provide the fetchData function to all components
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};