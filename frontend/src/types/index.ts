export interface User {
    id: number;
    name: string;
    email: string;
    timezone: string;
    week_start: number;
    time_format: string;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
    timezone?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: string;
    status: string;
    due_date?: string;
    due_time?: string;
    estimated_minutes?: number;
    actual_minutes?: number;
    category_id?: number;
    project_id?: number;
}

export interface Activity {
    id: number;
    title: string;
    activity_type: string;
    default_duration_minutes: number;
    is_recurring: boolean;
    category_id?: number;
}

export interface ActivityOccurrence {
    id: number;
    activity_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes?: string;
    is_override: boolean;
    activity?: Activity;
}
