import api from './api';

export interface Project {
    id: int;
    user_id: int;
    name: string;
    description?: string;
    status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    start_date?: string;
    deadline?: string;
    created_at: string;
    updated_at: string;
}

export const projectsService = {
    getProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },
    createProject: async (data: Partial<Project>) => {
        const response = await api.post('/projects', data);
        return response.data;
    },
    getProject: async (id: number) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    getProjectTasks: async (id: number) => {
        const response = await api.get(`/projects/${id}/tasks`);
        return response.data;
    },
    updateTaskStatus: async (taskId: number, status: string) => {
        const response = await api.patch(`/tasks/${taskId}/status`, { status });
        return response.data;
    }
};
