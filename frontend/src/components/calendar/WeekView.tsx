import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { CalendarViewProps } from './CalendarTypes';

export const WeekView: React.FC<CalendarViewProps> = ({ occurrences, selectedDate, isLoading, setSelectedEvent, onDragStart, onDragEnd, onDrop, onEmptySlotClick, onContextMenuAction, TIMELINE_HOURS }) => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const weekOccurrences = occurrences.filter(o => {
        const occDate = new Date(`${o.date}T00:00:00`);
        return occDate >= weekStart && occDate <= addDays(weekStart, 6);
    });

    const plannedCount = weekOccurrences.filter(o => o.status === 'SCHEDULED').length;
    const completedCount = weekOccurrences.filter(o => o.status === 'COMPLETED').length;
    const totalCount = weekOccurrences.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 relative">
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
                {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-500">Loading Planner...</div>}

                {/* Day Headers */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800"></div>
                    {weekDays.map(day => (
                        <div key={day.getTime()} className={`flex-1 min-w-0 p-3 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${isSameDay(day, new Date()) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSameDay(day, new Date()) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{format(day, 'E')}</div>
                            <div className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{format(day, 'd')}</div>
                        </div>
                    ))}
                </div>

                {/* Scrollable Timeline Grid */}
                <div className="flex-1 overflow-auto relative">
                    <div className="flex relative" style={{ height: `${TIMELINE_HOURS.length * 64}px` }}>
                        {/* Time labels axis */}
                        <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 sticky left-0">
                            {TIMELINE_HOURS.map(hour => (
                                <div key={hour} className="h-16 relative">
                                    <span className="absolute -top-3 right-2 text-xs font-bold text-slate-400">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                                </div>
                            ))}
                        </div>

                        {/* Days columns */}
                        {weekDays.map(day => {
                            const dateMatchStr = format(day, 'yyyy-MM-dd');
                            const dayOccurrences = occurrences.filter(o => o.date === dateMatchStr);

                            return (
                                <div key={day.getTime()} className="flex-1 min-w-[120px] relative border-r last:border-r-0 border-slate-100 dark:border-slate-800/50">
                                    {/* Hour Drop Zones */}
                                    {TIMELINE_HOURS.map((hour, i) => (
                                        <div
                                            key={i}
                                            className="h-16 border-b border-slate-100 dark:border-slate-800/30 w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                            onClick={() => onEmptySlotClick(day, hour)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => onDrop(e, day, hour)}
                                        ></div>
                                    ))}

                                    {/* Render Blocks */}
                                    {dayOccurrences.map(occ => {
                                        const startH = parseInt(occ.start_time.split(':')[0], 10);
                                        const startM = parseInt(occ.start_time.split(':')[1], 10);
                                        const endH = parseInt(occ.end_time.split(':')[0], 10);
                                        const endM = parseInt(occ.end_time.split(':')[1], 10);
                                        const startFraction = startH + (startM / 60);
                                        const endFraction = endH + (endM / 60);
                                        const topVal = (startFraction - TIMELINE_HOURS[0]) * 64;
                                        const heightVal = (endFraction - startFraction) * 64;

                                        if (startFraction < TIMELINE_HOURS[0] - 1) return null;

                                        // Check overlap
                                        const overlap = dayOccurrences.some(o => o.id !== occ.id && o.start_time < occ.end_time && o.end_time > occ.start_time);

                                        return (
                                            <div
                                                key={occ.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, occ)}
                                                onDragEnd={onDragEnd}
                                                onClick={() => setSelectedEvent(occ)}
                                                onContextMenu={(e) => onContextMenuAction?.(e, occ)}
                                                className={`absolute left-1 right-1 rounded-lg border text-xs p-1.5 cursor-move transition-transform hover:z-20 hover:scale-[1.02] overflow-hidden shadow-sm flex flex-col ${occ.status === 'COMPLETED' ? 'opacity-60 grayscale bg-emerald-50 border-emerald-500' : occ.status === 'SKIPPED' ? 'opacity-40 grayscale bg-slate-50 border-slate-400 line-through' : 'bg-slate-50 border-slate-300'}`}
                                                style={{
                                                    top: `${topVal + 2}px`,
                                                    height: `${heightVal - 4}px`,
                                                    zIndex: 5
                                                }}
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"
                                                    style={{ backgroundColor: occ.status === 'COMPLETED' ? '#10B981' : '#6366f1' }}></div>
                                                <div className="pl-1 font-bold text-slate-800 truncate flex items-center gap-1">
                                                    {overlap && <span className="text-amber-500" title="Conflict">⚠️</span>}
                                                    {occ.activity?.title}
                                                </div>
                                                <div className="pl-1 text-slate-500 font-medium text-[10px] mt-0.5 truncate">
                                                    {occ.start_time.substring(0, 5)} - {occ.end_time.substring(0, 5)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* This Week Analytics Sidebar */}
            <div className="w-full xl:w-72 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider text-xs">This Week</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative shrink-0">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                    <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                    <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={`${progress * 1.63} 163`} className="text-indigo-500 drop-shadow-sm transition-all duration-1000" />
                                </svg>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-100">{completedCount} Completed</div>
                                <div className="text-xs text-slate-500 mt-1">{totalCount} total activities</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{plannedCount}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Planned</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mt-1">Done</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
