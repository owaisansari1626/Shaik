import { fetchApi } from './api';
import { Activity, ActivityOccurrence } from '../types';

export const activitiesService = {
    async getActivities() {
        const response = await fetchApi('/api/activities');
        return response.data as Activity[];
    },

    async createActivity(activity: Partial<Activity>) {
        // In Phase 2, this is essentially a 1-off creation
        const response = await fetchApi('/api/activities', {
            method: 'POST',
            body: JSON.stringify(activity),
        });
        return response.data as Activity;
    }
};

export const scheduleService = {
    async getOccurrences(startDate: string, endDate: string) {
        const response = await fetchApi(`/api/schedule?start_date=${startDate}&end_date=${endDate}`);
        return response.data as ActivityOccurrence[];
    },

    async createOccurrence(occurrence: Partial<ActivityOccurrence>) {
        const response = await fetchApi('/api/schedule', {
            method: 'POST',
            body: JSON.stringify(occurrence),
        });
        return response.data as ActivityOccurrence;
    },

    async updateOccurrence(id: number, occurrence: Partial<ActivityOccurrence>) {
        const response = await fetchApi(`/api/schedule/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(occurrence),
        });
        return response.data as ActivityOccurrence;
    },

    async deleteOccurrence(id: number) {
        const response = await fetchApi(`/api/schedule/${id}`, {
            method: 'DELETE'
        });
        return response;
    },

    async overrideOccurrence(id: number, occurrence: Partial<ActivityOccurrence>) {
        const response = await fetchApi(`/api/schedule/${id}/override`, {
            method: 'POST',
            body: JSON.stringify(occurrence),
        });
        return response.data as ActivityOccurrence;
    },

    async splitOccurrence(id: number, startTime: string, endTime: string) {
        const response = await fetchApi(`/api/schedule/${id}/split`, {
            method: 'POST',
            body: JSON.stringify({ start_time: startTime, end_time: endTime }),
        });
        return response;
    }
};
