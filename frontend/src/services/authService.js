import apiClient from './apiClient';
export const authService = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.data.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        return response.data;
    },
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        if (response.data.data.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        return response.data;
    },
    logout: async () => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
    },
    updateProfile: async (data) => {
        const response = await apiClient.put('/auth/profile', data);
        return response.data.data;
    },
    changePassword: async (data) => {
        const response = await apiClient.put('/auth/password', data);
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (resetToken, newPassword) => {
        const response = await apiClient.post('/auth/reset-password', { resetToken, newPassword });
        return response.data;
    },
};
export default authService;
