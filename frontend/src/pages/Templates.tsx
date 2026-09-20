import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Plus } from 'lucide-react';
import { fetchApi } from '../services/api';
import { format } from 'date-fns';

export const Templates: React.FC = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [applyDate, setApplyDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [applyingId, setApplyingId] = useState<number | null>(null);

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const res = await fetchApi('/api/templates');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            await fetchApi(`/api/templates?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setName('');
            setDescription('');
        }
    });

    const applyMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetchApi(`/api/templates/${id}/apply?apply_date=${applyDate}`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            setApplyingId(null);
            alert('Template applied successfully!'); // simplistic feedback
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Templates</h2>
                    <p className="text-slate-500 mt-1">Bulk manage sets of activities mapped to days.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Create Template Form */}
                <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-sm h-min">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={18} className="text-indigo-500" /> New Template</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Exam Week" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Intense studying..." />
                        </div>
                        <button
                            onClick={() => createMutation.mutate()}
                            disabled={!name.trim() || createMutation.isPending}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Template'}
                        </button>
                    </div>
                </div>

                {/* Templates List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-slate-500">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Copy size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No templates found</h3>
                            <p className="text-slate-500 mb-6">Create a group of activities you repeat often.</p>
                        </div>
                    ) : (
                        templates.map((tpl: any) => (
                            <div key={tpl.id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Copy size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{tpl.name}</h3>
                                        <p className="text-sm text-slate-500">{tpl.description || 'No description provided'}</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <input
                                        type="date"
                                        value={applyingId === tpl.id ? applyDate : applyDate} // Ensure sync visually
                                        onChange={e => {
                                            setApplyingId(tpl.id);
                                            setApplyDate(e.target.value);
                                        }}
                                        className="w-full sm:w-36 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!applyingId) setApplyingId(tpl.id);
                                            applyMutation.mutate(tpl.id);
                                        }}
                                        disabled={applyMutation.isPending && applyingId === tpl.id}
                                        className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm whitespace-nowrap"
                                    >
                                        Apply From Date -&gt;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
