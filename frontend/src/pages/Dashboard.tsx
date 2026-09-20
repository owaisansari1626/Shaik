import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { calendarService } from '../services/calendar.service';
import { tasksService } from '../services/tasks.service';
import { analyticsService } from '../services/analytics.service';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Next 7 days for the chart
    const startStr = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    const endStr = todayStr;

    const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
        queryKey: ['calendar', 'day', todayStr],
        queryFn: () => calendarService.getDay(todayStr)
    });

    const { data: tasksData, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: tasksService.getTasks
    });

    const { data: progressData } = useQuery({
        queryKey: ['progress', todayStr],
        queryFn: () => analyticsService.getDailyProgress(todayStr)
    });

    const { data: weekData } = useQuery({
        queryKey: ['weekly', startStr, endStr],
        queryFn: () => analyticsService.getWeeklyOverview(startStr, endStr)
    });

    const todayOccurrences = scheduleData?.occurrences || [];
    const todayTasks = tasksData?.filter(t => t.due_date === todayStr) || [];

    // Real data injected from endpoints
    const allTodayItemsCount = progressData?.total?.planned || todayTasks.length;
    const completedTodayCount = progressData?.total?.completed || todayTasks.filter(t => t.status === 'COMPLETED').length;
    const completionRate = progressData?.total?.completion_percentage || 0;

    const weeklyData = weekData ? weekData.map((d: any) => ({
        name: format(new Date(d.date), 'EEE'),
        completed: d.total.completed,
        planned: d.total.planned
    })) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    Good afternoon, {user?.name?.split(' ')[0] || 'User'}
                </h2>
                <p className="text-slate-500 mt-1 text-lg">
                    {format(new Date(), 'EEEE, MMMM d')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Today's Tasks</p>
                        <p className="text-3xl font-bold mt-2">{allTodayItemsCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                        <CheckSquare size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold mt-2">{completedTodayCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Completion</p>
                        <p className="text-3xl font-bold mt-2">{completionRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold">
                        %
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Schedule & Tasks */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Timeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold">Today's Schedule</h3>
                        </div>
                        <div className="p-6">
                            {scheduleLoading ? <p className="text-slate-500">Loading schedule...</p> : null}
                            {!scheduleLoading && todayOccurrences.length === 0 ? (
                                <p className="text-slate-500">No scheduled activities for today.</p>
                            ) : (
                                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 py-2">
                                    {todayOccurrences.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((occ) => (
                                        <div key={occ.id} className="relative pl-6">
                                            <div className="absolute w-4 h-4 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-full -left-[9px] top-1"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-100">{occ.activity?.title || 'Unknown Activity'}</div>
                                                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <Clock size={14} />
                                                        {occ.start_time.substring(0, 5)} - {occ.end_time.substring(0, 5)}
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${occ.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    {occ.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Today's Tasks</h3>
                        {tasksLoading ? <p className="text-slate-500">Loading tasks...</p> : null}
                        {!tasksLoading && todayTasks.length === 0 ? (
                            <p className="text-slate-500">No tasks due today.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {todayTasks.map(task => (
                                    <div key={task.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                                        <div className="mt-0.5">
                                            <div className={`w-5 h-5 rounded border ${task.status === 'COMPLETED' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center cursor-pointer transition-colors`}>
                                                {task.status === 'COMPLETED' && <CheckCircle2 size={16} />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>{task.title}</p>
                                            <div className="flex gap-2 mt-2">
                                                {task.priority === 'HIGH' && <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-md">High</span>}
                                                {task.priority === 'MEDIUM' && <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-md">Medium</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Analytics / Extra widgets */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center">
                        <div className="w-full">
                            <h3 className="font-bold text-lg mb-6">Weekly Progress</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="completed" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
