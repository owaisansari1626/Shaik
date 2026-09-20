import api from './api';

export interface Exercise {
    id: number;
    user_id: number;
    name: string;
    category?: string;
    created_at: string;
}

export interface WorkoutSet {
    id?: number;
    set_number: number;
    reps?: number;
    weight?: number;
    duration?: number;
    rest_seconds?: number;
    completed: boolean;
}

export interface WorkoutExercise {
    id?: number;
    exercise_name: string;
    exercise_order: number;
    notes?: string;
    sets: WorkoutSet[];
}

export interface WorkoutSession {
    id: number;
    activity_occurrence_id?: number;
    workout_type: 'GYM' | 'RUNNING' | 'WALKING' | 'CYCLING' | 'SPORT' | 'OTHER';
    date: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: number;
    distance_km?: number;
    pace?: number;
    calories?: number;
    notes?: string;
    status: string;
    exercises: WorkoutExercise[];
    created_at: string;
}

export const workoutsService = {
    getSessions: async () => {
        const response = await api.get('/workouts');
        return response.data;
    },
    createSession: async (data: Partial<WorkoutSession>) => {
        const response = await api.post('/workouts', data);
        return response.data;
    },
    getExercises: async () => {
        const response = await api.get('/exercises');
        return response.data;
    },
    createExercise: async (data: Partial<Exercise>) => {
        const response = await api.post('/exercises', data);
        return response.data;
    }
};
