import React from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarViewProps } from './CalendarTypes';

export const DayView: React.FC<CalendarViewProps> = ({ occurrences, selectedDate, isLoading, setSelectedEvent, onDragStart, onDragEnd, onDrop, onEmptySlotClick, onContextMenuAction, TIMELINE_HOURS }) => {

    // DayView displays the currently selected date.
    const dayOccurrences = occurrences.filter(o => o.date === format(selectedDate, 'yyyy-MM-dd'));

    const planned = dayOccurrences.filter(o => o.status === 'SCHEDULED').length;
    const completed = dayOccurrences.filter(o => o.status === 'COMPLETED').length;
    const progress = dayOccurrences.length > 0 ? Math.round((completed / dayOccurrences.length) * 100) : 0;

    return (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 relative">

            {/* The Main Day Timeline */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
                {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center font-bold text-slate-500">Loading Planner...</div>}

                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${isSameDay(selectedDate, new Date()) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{format(selectedDate, 'd')}</div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-wider text-slate-500">{format(selectedDate, 'EEEE')}</div>
                            <div className="text-sm font-medium text-slate-400">{format(selectedDate, 'MMMM yyyy')}</div>
                        </div>
                    </div>
                    {/* Completion Ring Context */}
                    <div className="flex items-center gap-3">
                        <div className="text-right flex flex-col">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Today's Progress</span>
                            <span className="text-xs text-slate-500">{completed} / {dayOccurrences.length} completed</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="21" cy="21" r="21" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="21" cy="21" r="21" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={`${progress * 1.3} 132`} className="text-indigo-500 drop-shadow-sm transition-all duration-1000" />
                            </svg>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Timeline Grid - using extremely wide columns for day view */}
                <div className="flex-1 overflow-auto relative p-6 hide-scrollbar">
                    <div className="relative" style={{ height: `${TIMELINE_HOURS.length * 64}px` }}>
                        {TIMELINE_HOURS.map(hour => (
                            <div key={hour} className="flex gap-4 mb-16 relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                onClick={() => onEmptySlotClick?.(selectedDate, hour)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => onDrop(e, selectedDate, hour)}>
                                <div className="w-16 text-right shrink-0">
                                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 block -translate-y-2.5">
                                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                    </span>
                                </div>
                                <div className="flex-1 border-t-2 border-slate-100 dark:border-slate-800/80 relative">
                                </div>
                            </div>
                        ))}

                        {/* Rendering Blocks */}
                        {dayOccurrences.map(occ => {
                            const startH = parseInt(occ.start_time.split(':')[0], 10);
                            const startM = parseInt(occ.start_time.split(':')[1], 10);
                            const endH = parseInt(occ.end_time.split(':')[0], 10);
                            const endM = parseInt(occ.end_time.split(':')[1], 10);

                            const startFraction = startH + (startM / 60);
                            const endFraction = endH + (endM / 60);

                            const topVal = (startFraction - TIMELINE_HOURS[0]) * 64;
                            const heightVal = (endFraction - startFraction) * 64;

                            if (startFraction < TIMELINE_HOURS[0]) return null;

                            const overlap = dayOccurrences.some(o => o.id !== occ.id && o.start_time < occ.end_time && o.end_time > occ.start_time);

                            return (
                                <div
                                    key={occ.id}
                                    draggable
                                    onClick={() => setSelectedEvent(occ)}
                                    onContextMenu={(e) => onContextMenuAction?.(e, occ)}
                                    onDragStart={(e) => onDragStart(e, occ)}
                                    onDragEnd={onDragEnd}
                                    className={`absolute left-24 right-4 rounded-xl border p-3 cursor-move transition-transform hover:z-20 hover:scale-[1.01] hover:shadow-md overflow-hidden ${occ.status === 'COMPLETED' ? 'opacity-70 grayscale bg-emerald-50 border-emerald-500' : occ.status === 'SKIPPED' ? 'opacity-40 grayscale bg-slate-50 border-slate-400 line-through' : 'bg-slate-50 border-slate-300'}`}
                                    style={{
                                        top: `${topVal + 8}px`,
                                        height: `${heightVal - 16}px`,
                                        zIndex: 5
                                    }}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-400"
                                        style={{ backgroundColor: occ.status === 'COMPLETED' ? '#10B981' : '#6366f1' }}></div>
                                    <div className="flex justify-between items-start">
                                        <div className="ml-2">
                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                                {overlap && <span className="text-amber-500" title="Conflict">⚠️</span>}
                                                {occ.activity?.title || 'Activity'}
                                            </h4>
                                            <div className="text-xs text-slate-500 font-medium mt-1">
                                                {occ.start_time.substring(0, 5)} - {occ.end_time.substring(0, 5)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* The Free Time / Upcoming Sidebar optional side for Day View */}
            <div className="w-full xl:w-72 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider text-xs">UP NEXT</h3>
                    <div className="space-y-4">
                        {dayOccurrences.filter(o => o.status === 'SCHEDULED' && o.start_time >= format(new Date(), 'HH:mm:ss')).slice(0, 5).map(o => (
                            <div key={o.id} className="flex gap-4 items-center">
                                <div className="text-right shrink-0 w-12">
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.start_time.substring(0, 5)}</div>
                                </div>
                                <div className="flex-1 pl-3 border-l-2 border-indigo-500">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{o.activity?.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};
