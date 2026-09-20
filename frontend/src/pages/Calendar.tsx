import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, subWeeks, addWeeks, subDays, startOfMonth, endOfMonth, endOfWeek, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Search, Filter } from 'lucide-react';
import { scheduleService } from '../services/activities.service';
import { useDateContext } from '../store/DateContext';

import { ViewType } from '../components/calendar/CalendarTypes';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { ThreeDayView } from '../components/calendar/ThreeDayView';
import { MonthView } from '../components/calendar/MonthView';
import { QuickAddActivityModal } from '../components/calendar/QuickAddActivityModal';
import { ActivityDetailDrawer } from '../components/calendar/ActivityDetailDrawer';

const TIMELINE_HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export const Calendar: React.FC = () => {
    // 1. Context and State
    const { selectedDate, setSelectedDate, nextDay, prevDay, goToday } = useDateContext();

    // View Switcher with localStorage persistence
    const [view, setView] = useState<ViewType>(() => {
        const saved = localStorage.getItem('shaik_calendar_view');
        return (saved as ViewType) || 'Week';
    });

    useEffect(() => {
        localStorage.setItem('shaik_calendar_view', view);
    }, [view]);

    const queryClient = useQueryClient();

    // ------------------------------------
    // Modals and Quick actions
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [pendingUpdates, setPendingUpdates] = useState<{ date: string, s: string, e: string } | null>(null);

    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddInitial, setQuickAddInitial] = useState({ date: '', time: '' });

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, event: any } | null>(null);

    const handleEmptySlotClick = (date: Date, hour: number) => {
        setQuickAddInitial({
            date: format(date, 'yyyy-MM-dd'),
            time: `${hour.toString().padStart(2, '0')}:00:00`
        });
        setIsQuickAddOpen(true);
    };

    const handleContextMenu = (e: React.MouseEvent, occ: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, event: occ });
    };
    // ------------------------------------

    // 3. Compute Query Date Bounds based on View
    const getQueryRange = () => {
        if (view === 'Day') return { startStr: format(selectedDate, 'yyyy-MM-dd'), endStr: format(selectedDate, 'yyyy-MM-dd') };
        if (view === '3 Days') return { startStr: format(selectedDate, 'yyyy-MM-dd'), endStr: format(addDays(selectedDate, 2), 'yyyy-MM-dd') };
        if (view === 'Week') {
            const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
            return { startStr: format(start, 'yyyy-MM-dd'), endStr: format(addDays(start, 6), 'yyyy-MM-dd') };
        }
        if (view === 'Month') {
            const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
            const end = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });
            return { startStr: format(start, 'yyyy-MM-dd'), endStr: format(end, 'yyyy-MM-dd') };
        }
        return { startStr: format(selectedDate, 'yyyy-MM-dd'), endStr: format(selectedDate, 'yyyy-MM-dd') };
    };

    const { startStr, endStr } = getQueryRange();

    const { data: occurrences = [], isLoading } = useQuery({
        queryKey: ['schedule', startStr, endStr],
        queryFn: () => scheduleService.getOccurrences(startStr, endStr)
    });

    // 4. Mutations
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: number, updates: any }) => scheduleService.updateOccurrence(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setSelectedEvent(null);
            setIsConfirming(false);
        }
    });

    const overrideMutation = useMutation({
        mutationFn: ({ id, updates }: { id: number, updates: any }) => scheduleService.overrideOccurrence(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setSelectedEvent(null);
            setIsConfirming(false);
        }
    });

    const splitMutation = useMutation({
        mutationFn: ({ id, s, e }: { id: number, s: string, e: string }) => scheduleService.splitOccurrence(id, s, e),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setSelectedEvent(null);
            setIsConfirming(false);
        }
    });

    // 5. Shared Handlers
    const handleSaveInitiate = () => {
        const startInput = document.getElementById('drawer-edit-start') as HTMLInputElement;
        const endInput = document.getElementById('drawer-edit-end') as HTMLInputElement;
        if (!startInput || !endInput) return;

        const s = startInput.value + ":00";
        const e = endInput.value + ":00";
        const d = selectedEvent.date;

        if (selectedEvent.activity?.is_recurring) {
            setPendingUpdates({ date: d, s, e });
            setIsConfirming(true);
        } else {
            updateMutation.mutate({ id: selectedEvent.id, updates: { start_time: s, end_time: e, date: d } });
        }
    };

    const handleDragStart = (e: React.DragEvent, occ: any) => {
        e.dataTransfer.setData('application/json', JSON.stringify(occ));
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => (e.target as HTMLElement).style.opacity = '0.5', 0);
    };
    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date, targetHour: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const occ = JSON.parse(data);

        const newDateStr = format(targetDate, 'yyyy-MM-dd');

        const startH = parseInt(occ.start_time.split(':')[0], 10);
        const startM = parseInt(occ.start_time.split(':')[1], 10);
        const endH = parseInt(occ.end_time.split(':')[0], 10);
        const endM = parseInt(occ.end_time.split(':')[1], 10);

        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

        const newStartH = targetHour;
        const newStartM = 0;
        const newStartStr = `${newStartH.toString().padStart(2, '0')}:00:00`;

        const totalNewEndMinutes = newStartH * 60 + durationMinutes;
        const newEndH = Math.floor(totalNewEndMinutes / 60);
        const newEndM = totalNewEndMinutes % 60;
        const newEndStr = `${newEndH.toString().padStart(2, '0')}:${newEndM.toString().padStart(2, '0')}:00`;

        setSelectedEvent(occ);
        if (occ.activity?.is_recurring) {
            setPendingUpdates({ date: newDateStr, s: newStartStr, e: newEndStr });
            setIsConfirming(true);
        } else {
            updateMutation.mutate({ id: occ.id, updates: { date: newDateStr, start_time: newStartStr, end_time: newEndStr } });
        }
    };

    // Date Navigation helpers
    const handlePrev = () => {
        if (view === 'Day') prevDay();
        else if (view === '3 Days') setSelectedDate(subDays(selectedDate, 3));
        else if (view === 'Week') setSelectedDate(subWeeks(selectedDate, 1));
        else if (view === 'Month') setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const handleNext = () => {
        if (view === 'Day') nextDay();
        else if (view === '3 Days') setSelectedDate(addDays(selectedDate, 3));
        else if (view === 'Week') setSelectedDate(addWeeks(selectedDate, 1));
        else if (view === 'Month') setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    // Output Header format
    const getHeaderLabel = () => {
        if (view === 'Day') return format(selectedDate, 'MMMM d, yyyy');
        if (view === '3 Days') return `${format(selectedDate, 'MMM d')} - ${format(addDays(selectedDate, 2), 'MMM d, yyyy')}`;
        if (view === 'Week') {
            const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
            return `${format(start, 'MMM d')} - ${format(addDays(start, 6), 'MMM d, yyyy')}`;
        }
        if (view === 'Month') return format(selectedDate, 'MMMM yyyy');
        return '';
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CalendarIcon className="text-indigo-500" /> Planner
                    </h2>

                    {/* View Switcher UI Segmented Control */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {['Day', '3 Days', 'Week', 'Month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v as ViewType)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${view === v ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Global date range text */}
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mr-2 min-w-[150px] text-right">
                        {getHeaderLabel()}
                    </div>

                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={handlePrev} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"><ChevronLeft size={20} /></button>
                        <button onClick={goToday} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 border-x border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">Today</button>
                        <button onClick={handleNext} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Sub-toolbar (Search and Filters - placeholders for now as per spec 25/26/27) */}
            <div className="flex gap-2 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search schedule..." className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-64 outline-none focus:border-indigo-500" />
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Central View Controller */}
            {view === 'Day' && <DayView occurrences={occurrences} selectedDate={selectedDate} isLoading={isLoading} setSelectedEvent={setSelectedEvent} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} onEmptySlotClick={handleEmptySlotClick} onContextMenuAction={handleContextMenu} TIMELINE_HOURS={TIMELINE_HOURS} />}
            {view === '3 Days' && <ThreeDayView occurrences={occurrences} selectedDate={selectedDate} isLoading={isLoading} setSelectedEvent={setSelectedEvent} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} onEmptySlotClick={handleEmptySlotClick} onContextMenuAction={handleContextMenu} TIMELINE_HOURS={TIMELINE_HOURS} />}
            {view === 'Week' && <WeekView occurrences={occurrences} selectedDate={selectedDate} isLoading={isLoading} setSelectedEvent={setSelectedEvent} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} onEmptySlotClick={handleEmptySlotClick} onContextMenuAction={handleContextMenu} TIMELINE_HOURS={TIMELINE_HOURS} />}
            {view === 'Month' && <MonthView occurrences={occurrences} selectedDate={selectedDate} isLoading={isLoading} setSelectedEvent={setSelectedEvent} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} onEmptySlotClick={handleEmptySlotClick} onContextMenuAction={handleContextMenu} TIMELINE_HOURS={TIMELINE_HOURS} />}

            {/* Quick Add Modal */}
            <QuickAddActivityModal
                isOpen={isQuickAddOpen}
                initialDate={quickAddInitial.date}
                initialTime={quickAddInitial.time}
                onClose={() => setIsQuickAddOpen(false)}
            />

            {/* Modals are kept globally in Calendar to prevent duplication across views */}
            {selectedEvent && !isConfirming && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[40]" onClick={() => setSelectedEvent(null)}></div>
                    <ActivityDetailDrawer
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                        onEditInit={handleSaveInitiate}
                        updateMutation={updateMutation}
                    />
                </>
            )}

            {isConfirming && pendingUpdates && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm animate-in zoom-in-95 duration-200 border-2 border-indigo-500/10">
                        <h3 className="font-bold text-xl mb-2 text-slate-800">Recurring Activity</h3>
                        <p className="text-sm text-slate-500 mb-6">You are mapping or dragging a recurring schedule. How would you like to apply these changes?</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => overrideMutation.mutate({ id: selectedEvent.id, updates: { date: pendingUpdates.date, start_time: pendingUpdates.s, end_time: pendingUpdates.e } })}
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
                                onClick={() => { setIsConfirming(false); setPendingUpdates(null); }}
                                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 rounded-xl mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}></div>
                    <div
                        className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl py-2 w-48 animate-in zoom-in-95 duration-100"
                        style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
                    >
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                            <div className="text-xs font-bold text-slate-400 uppercase truncate">{contextMenu.event.activity?.title}</div>
                        </div>
                        {contextMenu.event.status !== 'COMPLETED' && (
                            <button onClick={() => { updateMutation.mutate({ id: contextMenu.event.id, updates: { status: 'COMPLETED' } }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-emerald-600 dark:text-emerald-400">Mark Completed</button>
                        )}
                        {contextMenu.event.status !== 'SKIPPED' && (
                            <button onClick={() => { updateMutation.mutate({ id: contextMenu.event.id, updates: { status: 'SKIPPED' } }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">Mark Skipped</button>
                        )}
                        <button onClick={() => { setSelectedEvent(contextMenu.event); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">Edit Details</button>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                        <button onClick={() => { updateMutation.mutate({ id: contextMenu.event.id, updates: { is_deleted: true } }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-rose-600 dark:text-rose-400">Delete Occurrence</button>
                    </div>
                </>
            )}
        </div>
    );
};
