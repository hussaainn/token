import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('toqn_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('toqn_token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Auth initialization error:', err);
                    localStorage.removeItem('toqn_token');
                    localStorage.removeItem('toqn_refresh_token');
                    localStorage.removeItem('toqn_user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData, token, refreshToken) => {
        setUser(userData);
        localStorage.setItem('toqn_token', token);
        localStorage.setItem('toqn_refresh_token', refreshToken);
        localStorage.setItem('toqn_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('toqn_token');
        localStorage.removeItem('toqn_refresh_token');
        localStorage.removeItem('toqn_user');
    };

    const updateProfile = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('toqn_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
