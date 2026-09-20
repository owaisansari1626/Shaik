import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Search, CheckCircle2, Circle, CheckSquare, X } from 'lucide-react';
import { tasksService } from '../services/tasks.service';
import { categoriesService } from '../services/categories.service';
import { projectsService } from '../services/projects.service';
import { Task } from '../types';

export const Tasks: React.FC = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Task form state
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [projectId, setProjectId] = useState<number | ''>('');

    const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: tasksService.getTasks });
    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesService.getCategories });
    const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectsService.getProjects });

    const toggleTaskMutation = useMutation({
        mutationFn: (task: Task) => tasksService.updateTask(task.id, { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
    });

    const createTaskMutation = useMutation({
        mutationFn: () => tasksService.createTask({
            title,
            priority,
            status: 'TODO',
            category_id: categoryId === '' ? undefined : Number(categoryId),
            project_id: projectId === '' ? undefined : Number(projectId)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsModalOpen(false);
            setTitle('');
            setPriority('MEDIUM');
            setCategoryId('');
            setProjectId('');
        }
    });

    const filteredTasks = tasks.filter(t => {
        // Search
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;

        // Filters
        if (filter === 'COMPLETED') return t.status === 'COMPLETED';
        if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
        if (filter === 'TODO') return t.status === 'TODO';
        if (filter === 'TODAY') return t.due_date === format(new Date(), 'yyyy-MM-dd');
        if (filter === 'HIGH') return t.priority === 'HIGH';

        return true; // 'ALL'
    }).sort((a, b) => {
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
        return 0;
    });
    return (
        <div className="space-y-6 animate-in fade-in duration-500" >

            {/* Header */}
            < div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" >
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tasks</h2>
                    <p className="text-slate-500 mt-1">Manage and track your actionable items.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} /> Create Task
                </button>
            </div >

            {/* Control Bar */}
            < div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm" >
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                    {['ALL', 'TODAY', 'HIGH', 'TODO', 'COMPLETED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                                ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div >

            {/* Task List */}
            < div className="space-y-3" >
                {
                    isLoading ? (
                        <p className="text-slate-500 py-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" > Loading...</p>
                    ) : filteredTasks.length === 0 ? (
                        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <CheckSquare size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Your day is clear</h3>
                            <p className="text-slate-500 mb-6">No tasks found matching your filters.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Add a new task</button>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <div key={task.id} className="group bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex gap-4 items-center">
                                <button
                                    onClick={() => toggleTaskMutation.mutate(task)}
                                    className={`text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ${task.status === 'COMPLETED' ? 'text-indigo-500 dark:text-indigo-400' : ''}`}
                                >
                                    {task.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5 opacity-80">
                                        {task.priority === 'HIGH' && <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-md">High Priority</span>}
                                        {task.priority === 'LOW' && <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md">Low Priority</span>}
                                        {categories.find(c => c.id === task.category_id) && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                                                {categories.find(c => c.id === task.category_id)?.name}
                                            </span>
                                        )}
                                        {projects.find((p: any) => p.id === task.project_id) && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-md flex gap-1 items-center">
                                                Proj: {projects.find((p: any) => p.id === task.project_id)?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
            </div >

            {/* Creation Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Create Task</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24} /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <select
                                            value={categoryId}
                                            onChange={e => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project</label>
                                        <select
                                            value={projectId}
                                            onChange={e => setProjectId(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>
                                            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={e => setPriority(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => title.trim() && createTaskMutation.mutate()}
                                    disabled={!title.trim() || createTaskMutation.isPending}
                                    className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {createTaskMutation.isPending ? 'Saving...' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
