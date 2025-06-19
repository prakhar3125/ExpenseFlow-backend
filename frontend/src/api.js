// The base URL of your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * A helper function to make API requests.
 * It automatically adds the 'Content-Type' and 'Authorization' headers.
 * @param {string} endpoint The API endpoint to call (e.g., '/auth/login').
 * @param {object} options The options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} The JSON response from the server.
 */
const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        
        // For successful but no-content responses (e.g., DELETE)
        if (response.status === 204) {
            return; 
        }

        const data = await response.json();

        if (!response.ok) {
            // If the server returns an error, reject the promise with the error message from the backend
            return Promise.reject(data);
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        // For network errors or if response isn't JSON, reject with a generic error
        return Promise.reject({ message: 'A network error occurred or the server is unreachable.' });
    }
};

// --- AUTH ENDPOINTS ---

/**
 * Logs in a user.
 * @param {object} credentials - { email, password }
 */
export const login = (credentials) => {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

/**
 * Signs up a new user.
 * @param {object} credentials - { email, password }
 */
export const signup = (credentials) => {
    return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};


// --- SOURCE ENDPOINTS ---

/**
 * Fetches all sources for the current user.
 */
export const getSources = () => {
    return request('/sources');
};

/**
 * Creates a new source.
 * @param {object} sourceData - The data for the new source.
 */
export const createSource = (sourceData) => {
    return request('/sources', {
        method: 'POST',
        body: JSON.stringify(sourceData),
    });
};

/**
 * Updates an existing source.
 * @param {number} id - The ID of the source to update.
 * @param {object} sourceData - The updated source data.
 */
export const updateSource = (id, sourceData) => {
    return request(`/sources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sourceData),
    });
};

/**
 * Deletes a source.
 * @param {number} id - The ID of the source to delete.
 */
export const deleteSource = (id) => {
    return request(`/sources/${id}`, {
        method: 'DELETE',
    });
};


// --- EXPENSE ENDPOINTS ---

/**
 * Fetches expenses with optional filters.
 * @param {object} params - An object of query parameters (e.g., { dateRange: 30, category: 'Food' }).
 */
export const getExpenses = (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses?${query}`);
};

/**
 * Adds a new expense.
 * @param {object} expenseData - The data for the new expense.
 */
export const addExpense = (expenseData) => {
    return request('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
    });
};

/**
 * Updates an existing expense.
 * @param {number} id - The ID of the expense to update.
 * @param {object} expenseData - The updated expense data.
 */
export const updateExpense = (id, expenseData) => {
    return request(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
    });
};

/**
 * Deletes an expense.
 * @param {number} id - The ID of the expense to delete.
 */
export const deleteExpense = (id) => {
    return request(`/expenses/${id}`, {
        method: 'DELETE',
    });
};