import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { CalendarViewProps } from './CalendarTypes';

export const MonthView: React.FC<CalendarViewProps> = ({ occurrences, selectedDate, isLoading, setSelectedEvent }) => {

    // Month View displays a calendar grid (usually 5 or 6 rows of 7 days)
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);

    // Pad to the start and end of the week for a traditional grid
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    return (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
            {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-500">Loading Calendar...</div>}

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 border-r last:border-r-0 border-slate-200 dark:border-slate-800">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 (or 6 depending on length)">
                {days.map(d => {
                    const dateMatchStr = format(d, 'yyyy-MM-dd');
                    const dayOccurrences = occurrences.filter(o => o.date === dateMatchStr);
                    const isToday = isSameDay(d, new Date());
                    const isCurrentMonth = isSameMonth(d, monthStart);

                    const completedCount = dayOccurrences.filter(o => o.status === 'COMPLETED').length;

                    return (
                        <div key={d.getTime()} className={`border-r border-b border-slate-100 dark:border-slate-800/50 p-2 overflow-hidden flex flex-col ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''} ${isToday ? 'bg-indigo-50/10' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-indigo-600 text-white' : (isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}`}>
                                    {format(d, 'd')}
                                </span>
                                {dayOccurrences.length > 0 && (
                                    <span className="text-xs font-bold text-slate-400">
                                        {completedCount}/{dayOccurrences.length}
                                    </span>
                                )}
                            </div>

                            {/* Render mini dots or tiny blocks */}
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
                                {dayOccurrences.map(occ => (
                                    <div
                                        key={occ.id}
                                        onClick={() => setSelectedEvent(occ)}
                                        className={`px-1.5 py-1 text-[10px] font-bold rounded truncate cursor-pointer transition-colors hover:bg-slate-200 ${occ.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 line-through' : 'bg-slate-100 text-slate-700'}`}
                                    >
                                        {occ.start_time.substring(0, 5)} {occ.activity?.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
