import { fetchApi } from './api';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const authService = {
    async register(credentials: RegisterCredentials) {
        const response = await fetchApi('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return response.data as User;
    },

    async login(credentials: LoginCredentials) {
        // OAuth2PasswordRequestForm expects form data
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await fetchApi('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        return response.data as AuthResponse;
    },

    async getMe() {
        const response = await fetchApi('/api/auth/me');
        return response.data as User;
    },
};
