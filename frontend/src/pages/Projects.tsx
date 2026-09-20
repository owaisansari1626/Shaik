import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { FolderIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Projects: React.FC = () => {
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getProjects
    });

    if (isLoading) {
        return <div className="p-8 text-white">Loading projects...</div>;
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold text-white mb-2">Projects</h1>
                    <p className="text-gray-400">Manage your long-term goals and milestones</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-black font-semibold rounded-lg hover:bg-brand-secondary transition-colors transition-transform active:scale-95">
                    <PlusIcon className="w-5 h-5" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-dark-card border border-dark-border rounded-xl text-center">
                        <div className="w-16 h-16 rounded-full bg-dark-bg/50 border border-dark-border flex items-center justify-center mb-4">
                            <FolderIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No active projects</h3>
                        <p className="text-gray-400 mb-6 max-w-md">Break down your big goals into manageable tasks by creating a project.</p>
                    </div>
                ) : (
                    projects?.map((p: any) => (
                        <div key={p.id} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-gray-500 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                    <FolderIcon className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-dark-bg border border-dark-border rounded-full text-xs text-gray-400 font-medium">
                                    {p.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{p.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-6">{p.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4" />
                                    <span>0 / 0 Tasks</span>
                                </div>
                                <span>{p.priority}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Projects;
