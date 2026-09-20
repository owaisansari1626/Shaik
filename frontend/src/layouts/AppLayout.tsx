import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, CheckSquare, Settings as SettingsIcon, LogOut, Menu, X, Plus, Activity, Clock, Layers, Flame, Folder } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useShortcuts } from '../hooks/useShortcuts';

export const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quickAddOpen, setQuickAddOpen] = useState(false);

    const collapseModals = () => {
        setQuickAddOpen(false);
    };

    useShortcuts({
        onNewTask: () => { setQuickAddOpen(true); /* later wire up task modal */ },
        onNewActivity: () => { setQuickAddOpen(true); /* later wire up activity modal */ },
        closeModals: collapseModals
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NAV_ITEMS = [
        { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/app/schedule', icon: Clock, label: 'Daily Schedule' },
        { to: '/app/calendar', icon: CalendarIcon, label: 'Weekly Planner' },
        { to: '/app/tasks', icon: CheckSquare, label: 'Tasks Matrix' },
        { to: '/app/activities', icon: Activity, label: 'Activities' },
        { to: '/app/workouts', icon: Flame, label: 'Workouts' },
        { to: '/app/projects', icon: Folder, label: 'Projects' },
        { to: '/app/templates', icon: Layers, label: 'Templates' },
    ];

    const SidebarContent = (
        <>
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <h1 className="font-bold text-xl ml-2 text-indigo-600 dark:text-indigo-400">ShaikTracker</h1>
                <button className="md:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
                <div className="mb-4 px-2">
                    <button
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                    >
                        <Plus size={18} /> Add New
                    </button>
                    {quickAddOpen && (
                        <div className="mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                            <button className="text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Task (N)</button>
                            <button className="text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Activity (A)</button>
                        </div>
                    )}
                </div>

                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Preferences
                </div>
                <NavLink
                    to="/app/settings"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                        }`
                    }
                >
                    <SettingsIcon size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform transform md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {SidebarContent}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="h-16 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 -ml-2 text-slate-500" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="text-sm font-medium text-slate-500 hidden sm:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center font-bold font-mono">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto pb-20">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
