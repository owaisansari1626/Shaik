import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/api'; // Assuming tasks are managed via main API
import { ArrowLeftIcon, PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const ProjectKanban: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['projects', id],
        queryFn: () => projectsService.getProject(Number(id))
    });

    const { data: tasks, isLoading: tasksLoading } = useQuery({
        queryKey: ['projects', id, 'tasks'],
        queryFn: () => projectsService.getProjectTasks(Number(id))
    });

    const updateTaskStatus = useMutation({
        mutationFn: ({ taskId, status }: { taskId: number, status: string }) =>
            projectsService.updateTaskStatus(taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', id, 'tasks'] });
        }
    });

    if (projectLoading || tasksLoading) {
        return <div className="p-8 text-white">Loading project board...</div>;
    }

    if (!project) return <div className="p-8 text-white">Project not found.</div>;

    const columns = [
        { id: 'PENDING', title: 'To Do', color: 'bg-slate-800 border-slate-700' },
        { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-900/20 border-blue-800' },
        { id: 'COMPLETED', title: 'Done', color: 'bg-green-900/20 border-green-800' }
    ];

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        e.dataTransfer.setData('taskId', taskId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = Number(e.dataTransfer.getData('taskId'));
        if (taskId) {
            updateTaskStatus.mutate({ taskId, status });
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/app/projects')}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white mb-1">{project.name}</h1>
                    <p className="text-slate-400 text-sm">Project Board</p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className={`w-80 flex-shrink-0 flex flex-col rounded-xl border ${col.color} bg-slate-900/50`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        <div className="p-4 border-b border-inherit flex items-center justify-between">
                            <h3 className="font-semibold text-slate-200">{col.title}</h3>
                            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded-md">
                                {tasks?.filter((t: any) => t.status === col.id).length || 0}
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-3">
                            {tasks?.filter((t: any) => t.status === col.id).map((task: any) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-grab active:cursor-grabbing hover:border-slate-500 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-slate-200">{task.title}</h4>
                                        <button className="text-slate-500 hover:text-slate-300">
                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                        {task.description || "No description"}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className={`text-xs px-2 py-1 rounded-md ${task.priority === 'HIGH' ? 'bg-red-500/10 text-red-400' : task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {task.priority || 'MEDIUM'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 transition-all">
                                <PlusIcon className="w-4 h-4" />
                                Add Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectKanban;
