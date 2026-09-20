import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (error) {
                console.error('Failed to authenticate token', error);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await initAuth();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
