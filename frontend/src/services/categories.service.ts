import { fetchApi } from './api';
import { Category } from '../types';

export const categoriesService = {
    async getCategories() {
        const response = await fetchApi('/api/categories');
        return response.data as Category[];
    },

    async createCategory(category: Partial<Category>) {
        const response = await fetchApi('/api/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
        return response.data as Category;
    },

    async updateCategory(id: number, category: Partial<Category>) {
        const response = await fetchApi(`/api/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(category),
        });
        return response.data as Category;
    },

    async deleteCategory(id: number) {
        const response = await fetchApi(`/api/categories/${id}`, {
            method: 'DELETE',
        });
        return response;
    }
};
