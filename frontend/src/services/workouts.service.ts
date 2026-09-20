import api from './api';

export interface Exercise {
    id: int;
    user_id: int;
    name: string;
    category?: string;
    created_at: string;
}

export interface WorkoutSet {
    id?: int;
    set_number: int;
    reps?: int;
    weight?: number;
    duration?: int;
    rest_seconds?: int;
    completed: boolean;
}

export interface WorkoutExercise {
    id?: int;
    exercise_name: string;
    exercise_order: int;
    notes?: string;
    sets: WorkoutSet[];
}

export interface WorkoutSession {
    id: int;
    activity_occurrence_id?: int;
    workout_type: 'GYM' | 'RUNNING' | 'WALKING' | 'CYCLING' | 'SPORT' | 'OTHER';
    date: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: int;
    distance_km?: number;
    pace?: number;
    calories?: int;
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
