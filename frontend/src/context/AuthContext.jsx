import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                }
                catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);
    const login = async (email, password) => {
        const result = await authService.login({ email, password });
        setUser(result.data.user);
    };
    const register = async (data) => {
        const result = await authService.register(data);
        // Registration now returns a message (email verification required), no auto-login
        return result;
    };
    const logout = async () => {
        try {
            await authService.logout();
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };
    const updateProfile = async (data) => {
        const updated = await authService.updateProfile(data);
        setUser(updated);
    };
    const refreshUser = async () => {
        try {
            const userData = await authService.getMe();
            setUser(userData);
        }
        catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };
    return (<AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            updateProfile,
            refreshUser,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
