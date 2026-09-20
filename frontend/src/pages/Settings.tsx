import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { categoriesService } from '../services/categories.service';
import { Category } from '../types';

export const Settings: React.FC = () => {
    const queryClient = useQueryClient();
    const [newCatName, setNewCatName] = useState('');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => categoriesService.createCategory({ name, icon: 'folder' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewCatName('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => categoriesService.deleteCategory(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
                <p className="text-slate-500 mt-1">Manage your application preferences and categories.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
                <h3 className="text-xl font-bold mb-6">Categories</h3>

                <div className="flex gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="New Category Name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={() => newCatName.trim() && createMutation.mutate(newCatName.trim())}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} /> Add
                    </button>
                </div>

                {isLoading ? (
                    <p className="text-slate-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p className="text-slate-500">No categories created yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((cat: Category) => (
                            <div key={cat.id} className="group p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-400">
                                        <Folder size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                </div>
                                <button
                                    onClick={() => deleteMutation.mutate(cat.id)}
                                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
