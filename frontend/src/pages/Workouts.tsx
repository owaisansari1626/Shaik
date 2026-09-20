import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workoutsService } from '../services/workouts.service';
import { PlayIcon, HomeIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Workouts: React.FC = () => {
    const [view, setView] = useState<'DASHBOARD' | 'HISTORY'>('DASHBOARD');

    const { data: workouts, isLoading } = useQuery({
        queryKey: ['workouts'],
        queryFn: workoutsService.getSessions
    });

    if (isLoading) {
        return <div className="p-8 text-white">Loading workouts...</div>;
    }

    const runningDistance = workouts?.reduce((acc: number, w: any) => acc + (w.distance_km || 0), 0) || 0;
    const totalTime = workouts?.reduce((acc: number, w: any) => acc + (w.duration_minutes || 0), 0) || 0;

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Workouts</h1>
                    <p className="text-gray-400">Track and manage your fitness journey</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-black font-semibold rounded-lg hover:bg-brand-secondary transition-colors transition-transform active:scale-95">
                        <PlayIcon className="w-5 h-5" />
                        Start Session
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border text-white font-semibold rounded-lg hover:bg-dark-border transition-colors">
                        Templates
                    </button>
                </div>
            </div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center gap-3 mb-4 text-blue-400">
                        <FireIcon className="w-6 h-6" />
                        <h3 className="font-semibold text-lg">Total Workouts</h3>
                    </div>
                    <div className="text-4xl font-bold text-white font-orbitron">
                        {workouts?.length || 0}
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-primary/20 transition-all"></div>
                    <div className="flex items-center gap-3 mb-4 text-brand-primary">
                        <HomeIcon className="w-6 h-6" />
                        <h3 className="font-semibold text-lg">Running</h3>
                    </div>
                    <div className="text-4xl font-bold text-white font-orbitron">
                        {runningDistance.toFixed(1)} <span className="text-lg text-gray-400 font-inter font-normal">km</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                        <ClockIcon className="w-6 h-6" />
                        <h3 className="font-semibold text-lg">Active Time</h3>
                    </div>
                    <div className="text-4xl font-bold text-white font-orbitron">
                        {totalTime} <span className="text-lg text-gray-400 font-inter font-normal">min</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <h2 className="text-xl font-semibold text-white mb-4">Recent Workouts</h2>
            <div className="space-y-4">
                {workouts?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-dark-card border border-dark-border rounded-xl text-center">
                        <div className="w-16 h-16 rounded-full bg-dark-bg/50 border border-dark-border flex items-center justify-center mb-4">
                            <PlayIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No workouts yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md">Start tracking your first workout session to build consistency.</p>
                        <button className="px-6 py-2 bg-brand-primary text-black font-semibold rounded-lg hover:bg-brand-secondary transition-colors">
                            + Track Session
                        </button>
                    </div>
                ) : (
                    workouts?.slice(0, 5).map((w: any) => (
                        <div key={w.id} className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center justify-between hover:border-gray-500 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${w.workout_type === 'GYM' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                    {w.workout_type === 'GYM' ? <FireIcon className="w-6 h-6" /> : <HomeIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{w.workout_type} Session</h3>
                                    <p className="text-sm text-gray-400">{new Date(w.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-medium">{w.duration_minutes || '--'} min</p>
                                {w.workout_type === 'RUNNING' && <p className="text-sm text-gray-400">{w.distance_km} km</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Workouts;
