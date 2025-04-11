import React, {createContext, useContext, useEffect, useState} from 'react';
import {api, AuthService} from "../../services";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            try {
                if (token) {
                    const user = AuthService.getCurrentUser();
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } else {
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error('Error loading user:', err);
                setError('Failed to authenticate user.');
                setCurrentUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AuthService.login(credentials);
            setToken(data.token);
            setCurrentUser(data);
            setIsAuthenticated(true);
            return data;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            return await AuthService.register(userData);
        } catch (err) {
            console.error('Register error:', err);
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        AuthService.logout();
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        currentUser,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;