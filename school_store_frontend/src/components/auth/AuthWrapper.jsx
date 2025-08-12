import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, checkAuthStatus } from '../../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[AuthWrapper] Checking authentication status...');
        // Check if user is already authenticated via session
        checkAuthStatus().then(result => {
            console.log('[AuthWrapper] Auth status result:', result);
            if (result.isAuthenticated && result.user) {
                console.log('[AuthWrapper] User is authenticated:', result.user);
                setUser(result.user);
            } else {
                console.log('[AuthWrapper] User is not authenticated');
            }
            setIsLoading(false);
        }).catch(error => {
            console.error('[AuthWrapper] Error checking auth status:', error);
            setIsLoading(false);
        });
    }, []);

    const login = async (username, password) => {
        console.log('[AuthWrapper] Login initiated for username:', username);
        const user = await loginService(username, password);
        console.log('[AuthWrapper] Login service returned user:', user);

        // Check if login was successful
        if (user && !user.success && user.error) {
            console.error('[AuthWrapper] Login failed:', user.error);
            return user;
        }

        setUser(user);

        if (user && user.role === 'teacher') {
            console.log('[AuthWrapper] User is teacher, redirecting to /teacher');
            navigate('/teacher');
        } else if (user && user.role === 'student') {
            console.log('[AuthWrapper] User is student, redirecting to /student');
            navigate('/student');
        } else {
            console.log('[AuthWrapper] Unknown user role or login failed');
        }

        return user;
    };

    const logout = () => {
        // For session-based auth, we might need to call the backend logout endpoint
        setUser(null);
        navigate('/');
    };

    const refreshUser = async () => {
        console.log('[AuthWrapper] Refreshing user data...');
        try {
            const result = await checkAuthStatus();
            if (result.isAuthenticated && result.user) {
                setUser(result.user);
                console.log('[AuthWrapper] User data refreshed:', result.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('[AuthWrapper] Error refreshing user data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated: !!user, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;