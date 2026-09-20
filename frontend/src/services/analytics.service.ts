import { fetchApi } from './api';

export const analyticsService = {
    async getDailyProgress(date: string) {
        const response = await fetchApi(`/api/analytics/daily?date=${date}`);
        return response.data;
    },

    async getWeeklyOverview(startDate: string, endDate: string) {
        const response = await fetchApi(`/api/analytics/weekly?start_date=${startDate}&end_date=${endDate}`);
        return response.data;
    }
};
