import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { CalendarViewProps } from './CalendarTypes';
import { WeekView } from './WeekView';

export const ThreeDayView: React.FC<CalendarViewProps> = (props) => {
    // 3-Day View is functionally identical to WeekView, just rendered with a 3-day array.
    // Instead of duplicating, we will implement this natively alongside WeekView or use a small wrapper.
    // For extreme simplicity, let's just make a localized copy of the WeekView engine logic stripped down to 3 days!

    // Day views loop exactly like week.

    const { occurrences, selectedDate, isLoading, setSelectedEvent, onDragStart, onDragEnd, onDrop, onEmptySlotClick, onContextMenuAction, TIMELINE_HOURS } = props;

    // We show Today, Tomorrow, Day After Tomorrow relative to selectedDate or always Today?
    // User requested "Today, Tomorrow, Day After". We'll just map 3 days starting from selectedDate.
    const threeDays = Array.from({ length: 3 }, (_, i) => addDays(selectedDate, i));

    return (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
            {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-500">Loading Planner...</div>}

            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800"></div>
                {threeDays.map(day => (
                    <div key={day.getTime()} className={`flex-1 min-w-0 p-4 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${isSameDay(day, new Date()) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}>
                        <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${isSameDay(day, new Date()) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{format(day, 'EEEE')}</div>
                        <div className={`text-2xl font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{format(day, 'd MMMM')}</div>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-auto relative">
                <div className="flex relative" style={{ height: `${TIMELINE_HOURS.length * 64}px` }}>
                    <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 sticky left-0">
                        {TIMELINE_HOURS.map(hour => (
                            <div key={hour} className="h-16 relative">
                                <span className="absolute -top-3 right-2 text-xs font-bold text-slate-400">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                            </div>
                        ))}
                    </div>

                    {threeDays.map(day => {
                        const dateMatchStr = format(day, 'yyyy-MM-dd');
                        const dayOccurrences = occurrences.filter(o => o.date === dateMatchStr);

                        return (
                            <div key={day.getTime()} className="flex-1 min-w-[200px] relative border-r last:border-r-0 border-slate-100 dark:border-slate-800/50">
                                {TIMELINE_HOURS.map((hour, i) => (
                                    <div
                                        key={i}
                                        className="h-16 border-b border-slate-100 dark:border-slate-800/30 w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                        onClick={() => onEmptySlotClick(day, hour)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => onDrop(e, day, hour)}
                                    ></div>
                                ))}

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

                                    const overlap = dayOccurrences.some(o => o.id !== occ.id && o.start_time < occ.end_time && o.end_time > occ.start_time);

                                    return (
                                        <div
                                            key={occ.id}
                                            draggable
                                            onClick={() => setSelectedEvent(occ)}
                                            onContextMenu={(e) => onContextMenuAction?.(e, occ)}
                                            onDragStart={(e) => onDragStart(e, occ)}
                                            onDragEnd={onDragEnd}
                                            className={`absolute left-3 right-3 rounded-xl border text-sm p-3 cursor-move transition-transform hover:z-20 hover:scale-[1.01] overflow-hidden shadow-sm flex flex-col ${occ.status === 'COMPLETED' ? 'opacity-60 grayscale bg-emerald-50 border-emerald-500' : occ.status === 'SKIPPED' ? 'opacity-40 grayscale bg-slate-50 border-slate-400 line-through' : 'bg-slate-50 border-slate-300'}`}
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
                                            <div className="pl-1 text-slate-500 font-medium text-xs mt-1">
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
    );
};
