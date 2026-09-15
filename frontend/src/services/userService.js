import apiClient from './apiClient';
export const userService = {
    async getUsers(params) {
        const response = await apiClient.get('/users', { params });
        return response.data;
    },
    async getUserById(id) {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data;
    },
    async createUser(data) {
        const response = await apiClient.post('/users', data);
        return response.data.data;
    },
    async updateUser(id, data) {
        const response = await apiClient.patch(`/users/${id}`, data);
        return response.data.data;
    },
    async toggleStatus(id) {
        const response = await apiClient.patch(`/users/${id}/status`);
        return response.data.data;
    },
};
