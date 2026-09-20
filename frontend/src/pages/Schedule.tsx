import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useDateContext } from '../store/DateContext';
import { scheduleService } from '../services/activities.service';

const TIMELINE_HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export const Schedule: React.FC = () => {
    const { selectedDate, nextDay, prevDay, goToday } = useDateContext();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isConfirming, setIsConfirming] = useState<'update' | 'delete' | null>(null);
    const [pendingUpdates, setPendingUpdates] = useState<{ s: string, e: string } | null>(null);

    const { data: occurrences = [], isLoading } = useQuery({
        queryKey: ['schedule', dateStr],
        queryFn: () => scheduleService.getOccurrences(dateStr, dateStr)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: number, updates: any }) => scheduleService.updateOccurrence(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule', dateStr] });
            setSelectedEvent(null);
            setIsConfirming(null);
        }
    });

    const overrideMutation = useMutation({
        mutationFn: ({ id, updates }: { id: number, updates: any }) => scheduleService.overrideOccurrence(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setSelectedEvent(null);
            setIsConfirming(null);
        }
    });

    const splitMutation = useMutation({
        mutationFn: ({ id, s, e }: { id: number, s: string, e: string }) => scheduleService.splitOccurrence(id, s, e),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setSelectedEvent(null);
            setIsConfirming(null);
        }
    });

    // For entire series we just use the default edit of the modal in other views or future impl.

    const handleSaveInitiate = () => {
        const s = (document.getElementById('edit-start') as HTMLInputElement).value + ":00";
        const e = (document.getElementById('edit-end') as HTMLInputElement).value + ":00";

        if (selectedEvent.activity?.is_recurring) {
            setPendingUpdates({ s, e });
            setIsConfirming('update');
        } else {
            updateMutation.mutate({ id: selectedEvent.id, updates: { start_time: s, end_time: e } });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
                <button onClick={prevDay} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center cursor-pointer" onClick={goToday}>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{format(selectedDate, 'MMMM d, yyyy')}</span>
                    <span className="text-sm font-medium text-slate-500">{format(selectedDate, 'EEEE')}</span>
                </div>
                <button onClick={nextDay} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Timeline Layout */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Clock size={20} className="text-indigo-500" /> Timeline</h2>
                </div>

                <div className="flex-1 overflow-y-auto relative p-6 hide-scrollbar">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">Loading timeline...</div>}

                    <div className="relative min-h-[800px]">
                        {/* Timeline hour markers */}
                        {TIMELINE_HOURS.map(hour => (
                            <div key={hour} className="flex gap-4 mb-16 relative">
                                <div className="w-16 text-right shrink-0">
                                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 block -translate-y-2.5">
                                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                    </span>
                                </div>
                                <div className="flex-1 border-t-2 border-slate-100 dark:border-slate-800/80 relative">
                                    <div className="absolute left-0 top-0 w-full h-16 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Rendering Blocks */}
                        {occurrences.map(occ => {
                            const startH = parseInt(occ.start_time.split(':')[0], 10);
                            const startM = parseInt(occ.start_time.split(':')[1], 10);
                            const endH = parseInt(occ.end_time.split(':')[0], 10);
                            const endM = parseInt(occ.end_time.split(':')[1], 10);

                            const startFraction = startH + (startM / 60);
                            const endFraction = endH + (endM / 60);

                            const topVal = (startFraction - 6) * 64;
                            const heightVal = (endFraction - startFraction) * 64;

                            if (startFraction < 5) return null;

                            return (
                                <div
                                    key={occ.id}
                                    onClick={() => setSelectedEvent(occ)}
                                    className="absolute left-20 right-4 rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md overflow-hidden"
                                    style={{
                                        top: `${topVal + 8}px`,
                                        height: `${heightVal - 16}px`,
                                        backgroundColor: occ.status === 'COMPLETED' ? '#ECFDF5' : '#F8FAFC',
                                        borderColor: occ.status === 'COMPLETED' ? '#10B981' : '#CBD5E1',
                                        zIndex: 5
                                    }}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"
                                        style={{ backgroundColor: occ.status === 'COMPLETED' ? '#10B981' : '#6366f1' }}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{occ.activity?.title || 'Activity'}</h4>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                {occ.start_time.substring(0, 5)} - {occ.end_time.substring(0, 5)}
                                            </div>
                                        </div>
                                        {occ.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Detail Drawer / Modal for editing occurrence */}
            {selectedEvent && !isConfirming && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-xl">{selectedEvent.activity?.title || 'Unknown Activity'}</h3>
                                {selectedEvent.is_override && <span className="ml-2 text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">OVERRIDE</span>}
                                <span className="px-2 py-0.5 mt-2 block w-max rounded-md text-xs font-bold bg-slate-100 text-slate-500 tracking-wider">
                                    {selectedEvent.status}
                                </span>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Time (Start / End)</label>
                                <div className="flex items-center gap-2">
                                    <input type="time" defaultValue={selectedEvent.start_time.substring(0, 5)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" id="edit-start" />
                                    <span className="text-slate-400 text-sm">to</span>
                                    <input type="time" defaultValue={selectedEvent.end_time.substring(0, 5)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" id="edit-end" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2 border-t pt-6">
                            {selectedEvent.status !== 'COMPLETED' && (
                                <button
                                    onClick={() => updateMutation.mutate({ id: selectedEvent.id, updates: { status: 'COMPLETED' } })}
                                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm shadow-emerald-500/20"
                                >
                                    Mark as Completed
                                </button>
                            )}
                            <button
                                onClick={handleSaveInitiate}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold rounded-xl outline-none"
                            >
                                Save Time Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MUTATION CONFIRMATION DIALOG */}
            {isConfirming === 'update' && pendingUpdates && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm animate-in zoom-in-95 duration-200 border-2 border-indigo-500/10">
                        <h3 className="font-bold text-xl mb-2 text-slate-800">Recurring Activity</h3>
                        <p className="text-sm text-slate-500 mb-6">You are modifying a recurring schedule. How would you like to apply these time changes?</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => overrideMutation.mutate({ id: selectedEvent.id, updates: { start_time: pendingUpdates.s, end_time: pendingUpdates.e } })}
                                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-colors"
                            >
                                <span className="block font-bold text-slate-800">Change this occurrence only</span>
                                <span className="block text-xs text-slate-400 mt-0.5">Creates an override breaking it from the main rule.</span>
                            </button>
                            <button
                                onClick={() => splitMutation.mutate({ id: selectedEvent.id, s: pendingUpdates.s, e: pendingUpdates.e })}
                                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-colors"
                            >
                                <span className="block font-bold text-slate-800">Change this and future</span>
                                <span className="block text-xs text-slate-400 mt-0.5">Splits the schedule creating a new underlying recurrence.</span>
                            </button>
                            <button
                                onClick={() => { setIsConfirming(null); setPendingUpdates(null); }}
                                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 rounded-xl mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CheckCircle2 = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
);
