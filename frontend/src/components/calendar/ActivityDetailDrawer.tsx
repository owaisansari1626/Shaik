import React from 'react';
import { X, Check, SkipForward, Edit2, Copy, Move, Trash2, Calendar as CalIcon } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import { format } from 'date-fns';

export const ActivityDetailDrawer: React.FC<{
    event: any,
    onClose: () => void,
    onEditInit: () => void,
    updateMutation: UseMutationResult<any, Error, { id: number; updates: any; }, unknown>
}> = ({ event, onClose, onEditInit, updateMutation }) => {
    if (!event) return null;

    const eventDate = new Date(`${event.date}T00:00:00`);

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${event.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : event.status === 'SKIPPED' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                            {event.status}
                        </span>
                        {event.is_override && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">OVERRIDE</span>}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{event.activity?.title || 'Activity'}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                        {event.start_time.substring(0, 5)} – {event.end_time.substring(0, 5)}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Information blocks */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Category</h4>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                            {event.activity?.category?.name || 'Uncategorized'}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                            {event.activity?.activity_type}
                        </span>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Recurrence</h4>
                    {event.activity?.is_recurring ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <CalIcon size={16} className="text-indigo-500" /> This is an occurrence of a recurring series.
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500">One-time activity.</div>
                    )}
                </div>

                {/* Edit Form embed (replaces the modal input flow) */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Edit Time</h4>
                    <div className="flex items-center gap-2">
                        <input type="time" defaultValue={event.start_time.substring(0, 5)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" id="drawer-edit-start" />
                        <span className="text-slate-400 text-sm">to</span>
                        <input type="time" defaultValue={event.end_time.substring(0, 5)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" id="drawer-edit-end" />
                        <button onClick={onEditInit} className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 font-bold" title="Save Time Change">
                            <Check size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    {event.status !== 'COMPLETED' && (
                        <button
                            onClick={() => updateMutation.mutate({ id: event.id, updates: { status: 'COMPLETED' } })}
                            className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
                        >
                            <Check size={16} /> Complete
                        </button>
                    )}
                    {event.status !== 'SKIPPED' && (
                        <button
                            onClick={() => updateMutation.mutate({ id: event.id, updates: { status: 'SKIPPED' } })}
                            className="flex items-center justify-center gap-2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                            <SkipForward size={16} /> Skip
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                    <button className="flex flex-col items-center justify-center gap-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Edit2 size={16} /> Edit
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Copy size={16} /> Dup
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Move size={16} /> Move
                    </button>
                    <button
                        onClick={() => updateMutation.mutate({ id: event.id, updates: { is_deleted: true } })}
                        className="flex flex-col items-center justify-center gap-1 p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-100"
                    >
                        <Trash2 size={16} /> Del
                    </button>
                </div>
            </div>
        </div>
    );
};
