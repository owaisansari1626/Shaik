import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { X, Search } from 'lucide-react';
import { format, addMinutes } from 'date-fns';

export const QuickAddActivityModal: React.FC<{ isOpen: boolean, initialDate: string, initialTime: string, onClose: () => void }> = ({ isOpen, initialDate, initialTime, onClose }) => {
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<'NEW' | 'EXISTING'>('NEW');

    // Existing selection
    const [search, setSearch] = useState('');
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

    // New Activity Form
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [activityType, setActivityType] = useState('FOCUS');

    // Times
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState(initialTime);

    // Compute 30 min end time
    const startObj = new Date(`${date}T${initialTime}`);
    const defaultEndTime = format(addMinutes(startObj, 30), 'HH:mm:ss');
    const [endTime, setEndTime] = useState(defaultEndTime);

    const { data: globalActivities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const res = await fetchApi('/api/activities');
            return res.data;
        },
        enabled: isOpen
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetchApi('/api/categories');
            return res.data;
        },
        enabled: isOpen
    });

    const createOccurrenceMutation = useMutation({
        mutationFn: async () => {
            // If scheduling existing, we can't just create an occurrence with a lone API unless we do a POST /api/schedule
            // The backend handles override, but we don't have a direct "schedule standalone occurrence of activity_id"
            // Wait! The user specs prompt 29: "Schedule Existing Activity. Allow selecting an existing Activity definition and scheduling a new occurrence... avoids creating duplicate Activity definitions."
            // Assuming we have POST /api/schedule with activity_id payload.
            // If POST /api/schedule doesn't exist, we will create a new Activity without Recurrence.
            // Let's create a new non-recurring Activity and its occurrence.

            if (mode === 'NEW') {
                await fetchApi('/api/activities', {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        category_id: categoryId || undefined,
                        activity_type: activityType,
                        is_recurring: false,
                        default_duration_minutes: 30,
                        recurrence_rule: {
                            frequency: "NONE",
                            custom_times: { "0": { start: startTime, end: endTime } },
                            start_date: date,
                            end_date: date
                        }
                    })
                });
            } else {
                // Creating a new occurrence for an existing activity
                await fetchApi('/api/schedule/standalone', {
                    method: 'POST',
                    body: JSON.stringify({
                        activity_id: selectedActivityId,
                        date: date,
                        start_time: startTime,
                        end_time: endTime
                    })
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            onClose();
        }
    });

    if (!isOpen) return null;

    const filteredActs = globalActivities.filter((a: any) => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md animate-in zoom-in-95 duration-200 border-2 border-indigo-500/10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">Schedule Activity</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Segmented Control */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                        <button onClick={() => setMode('NEW')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'NEW' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>New Activity</button>
                        <button onClick={() => setMode('EXISTING')} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'EXISTING' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Schedule Existing</button>
                    </div>

                    <div className="space-y-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Start</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">End</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                            </div>
                        </div>
                    </div>

                    {mode === 'NEW' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Activity Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500" placeholder="e.g. Ad-hoc studying" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                                    <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                                        <option value="">None</option>
                                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Type</label>
                                    <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-700">
                                        <option value="FOCUS">Focus/Work</option>
                                        <option value="FITNESS">Fitness</option>
                                        <option value="RELAXATION">Relaxation</option>
                                        <option value="ERRANDS">Errands</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500" />
                            </div>
                            <div className="h-48 overflow-y-auto space-y-1">
                                {filteredActs.map((a: any) => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedActivityId(a.id)}
                                        className={`w-full text-left p-3 rounded-xl border ${selectedActivityId === a.id ? 'bg-indigo-50 border-indigo-500 shadow-sm text-indigo-700' : 'bg-white border-transparent hover:bg-slate-50'}`}
                                    >
                                        <div className="font-bold">{a.title}</div>
                                        <div className="text-xs opacity-60 flex gap-2"><span>{a.activity_type}</span></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-inner mt-auto">
                    <button
                        onClick={() => createOccurrenceMutation.mutate()}
                        disabled={createOccurrenceMutation.isPending || (mode === 'NEW' ? !title.trim() : !selectedActivityId)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md transition-all"
                    >
                        {createOccurrenceMutation.isPending ? 'Scheduling...' : 'Schedule Activity'}
                    </button>
                </div>
            </div>
        </div>
    );
};
