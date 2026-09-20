import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Activity as ActivityIcon, Settings, Calendar, Clock, X, Repeat } from 'lucide-react';
import { activitiesService, scheduleService } from '../services/activities.service';
import { categoriesService } from '../services/categories.service';
import { format } from 'date-fns';

export const Activities: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [activityType, setActivityType] = useState('GENERAL');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    // Phase 3 Recurrence State
    const [recurrenceType, setRecurrenceType] = useState('NONE');
    const [customDays, setCustomDays] = useState<Record<string, { checked: boolean, start: string, end: string }>>({
        '0': { checked: false, start: '09:00', end: '10:00' },
        '1': { checked: false, start: '09:00', end: '10:00' },
        '2': { checked: false, start: '09:00', end: '10:00' },
        '3': { checked: false, start: '09:00', end: '10:00' },
        '4': { checked: false, start: '09:00', end: '10:00' },
        '5': { checked: false, start: '09:00', end: '10:00' },
        '6': { checked: false, start: '09:00', end: '10:00' },
    });

    const { data: activities = [], isLoading } = useQuery({ queryKey: ['activities'], queryFn: activitiesService.getActivities });
    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesService.getCategories });

    const createMutation = useMutation({
        mutationFn: async () => {

            if (recurrenceType === 'NONE') {
                const activity = await activitiesService.createActivity({
                    title,
                    activity_type: activityType,
                    is_recurring: false,
                    category_id: categoryId === '' ? undefined : Number(categoryId)
                });
                await scheduleService.createOccurrence({
                    activity_id: activity.id,
                    date,
                    start_time: startTime + ":00",
                    end_time: endTime + ":00",
                    status: 'SCHEDULED',
                    is_override: false
                });
            } else {
                // Determine custom times mapping
                const custom_times: Record<string, any> = {};
                let days_of_week: number[] | undefined = undefined;

                if (recurrenceType === 'CUSTOM') {
                    days_of_week = Object.keys(customDays).filter(k => customDays[k].checked).map(Number);
                    days_of_week.forEach(d => {
                        custom_times[d] = {
                            start_time: customDays[d.toString()].start + ':00',
                            end_time: customDays[d.toString()].end + ':00'
                        };
                    });
                } else {
                    // Populate all 7 days with the uniform time so the backend generator respects it
                    for (let i = 0; i < 7; i++) {
                        custom_times[i] = {
                            start_time: startTime + ':00',
                            end_time: endTime + ':00'
                        };
                    }
                }

                await activitiesService.createActivity({
                    title,
                    activity_type: activityType,
                    is_recurring: true,
                    category_id: categoryId === '' ? undefined : Number(categoryId),
                    recurrence_rule: {
                        frequency: recurrenceType,
                        start_date: date,
                        days_of_week,
                        custom_times
                    }
                } as any);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            setIsModalOpen(false);
        }
    });

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Activities</h2>
                    <p className="text-slate-500 mt-1">Abstract templates underlying your schedule occurrences.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} /> New Activity Rules
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p className="text-slate-500 py-4 col-span-full">Loading...</p>
                ) : activities.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <ActivityIcon size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No activities found</h3>
                        <p className="text-slate-500 mb-6">Create recurring architectures here.</p>
                    </div>
                ) : (
                    activities.map(act => (
                        <div key={act.id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    {act.activity_type === 'GYM' || act.activity_type === 'RUNNING' ? <ActivityIcon size={20} /> : <Settings size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        {act.title}
                                        {act.is_recurring && <Repeat size={14} className="text-indigo-500" />}
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{act.activity_type}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Advanced Activity Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold border-b-2 border-indigo-500 pb-1 inline-block">Create Activity Setup</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Name</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Gym, Study Session" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">None</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {['GENERAL', 'GYM', 'RUNNING', 'STUDY', 'COLLEGE', 'CODING', 'PERSONAL', 'REST', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* RECURRENCE PHASE 3 UI */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repeat</label>
                                <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="NONE">Does not repeat</option>
                                    <option value="DAILY">Every day</option>
                                    <option value="WEEKLY">Every week</option>
                                    <option value="WEEKDAYS">Weekdays</option>
                                    <option value="WEEKENDS">Weekends</option>
                                    <option value="CUSTOM">Custom days & times</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            {recurrenceType !== 'CUSTOM' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recurrenceType === 'CUSTOM' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Configure Selected Days</h4>
                                    {Object.keys(customDays).map((dayIndex) => (
                                        <div key={dayIndex} className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={customDays[dayIndex].checked}
                                                onChange={(e) => setCustomDays(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], checked: e.target.checked } }))}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white"
                                            />
                                            <span className="w-10 text-sm font-medium text-slate-600 dark:text-slate-400">{dayLabels[Number(dayIndex)]}</span>

                                            {customDays[dayIndex].checked && (
                                                <div className="flex gap-2 flex-1">
                                                    <input
                                                        type="time"
                                                        value={customDays[dayIndex].start}
                                                        onChange={(e) => setCustomDays(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], start: e.target.value } }))}
                                                        className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                                                    />
                                                    <span className="text-slate-400 self-center">→</span>
                                                    <input
                                                        type="time"
                                                        value={customDays[dayIndex].end}
                                                        onChange={(e) => setCustomDays(prev => ({ ...prev, [dayIndex]: { ...prev[dayIndex], end: e.target.value } }))}
                                                        className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button
                                onClick={() => createMutation.mutate()}
                                disabled={!title.trim() || createMutation.isPending}
                                className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Saving...' : 'Save Activity'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
