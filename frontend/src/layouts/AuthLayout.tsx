import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">ShaikTracker</h1>
                    <p className="text-slate-500 mt-2">Manage your schedule and track progress</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
