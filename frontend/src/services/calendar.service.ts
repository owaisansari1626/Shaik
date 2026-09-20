import { fetchApi } from './api';
import { ActivityOccurrence, Task } from '../types';

export const calendarService = {
    async getDay(date: string) {
        const response = await fetchApi(`/api/calendar/day?date=${date}`);
        return response.data as { occurrences: ActivityOccurrence[], tasks: Task[] };
    },

    async getWeek(startDate: string) {
        const response = await fetchApi(`/api/calendar/week?start_date=${startDate}`);
        return response.data as { occurrences: ActivityOccurrence[], tasks: Task[] };
    }
};
