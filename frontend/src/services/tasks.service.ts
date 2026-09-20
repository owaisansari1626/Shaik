import { fetchApi } from './api';
import { Task } from '../types';

export const tasksService = {
    async getTasks() {
        const response = await fetchApi('/api/tasks');
        return response.data as Task[];
    },

    async createTask(task: Partial<Task>) {
        const response = await fetchApi('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
        return response.data as Task;
    },

    async updateTask(id: number, task: Partial<Task>) {
        const response = await fetchApi(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(task),
        });
        return response.data as Task;
    },

    async deleteTask(id: number) {
        const response = await fetchApi(`/api/tasks/${id}`, {
            method: 'DELETE',
        });
        return response;
    }
};
