import apiClient from './apiClient';
export const settingService = {
    async getSettings() {
        const response = await apiClient.get('/settings');
        return response.data.data;
    },
    async getBusinessHours() {
        const response = await apiClient.get('/settings/business-hours');
        return response.data.data;
    },
    async updateBusinessHours(data) {
        const response = await apiClient.patch('/settings/business-hours', data);
        return response.data.data;
    },
    async getCategories() {
        const response = await apiClient.get('/settings/categories');
        return response.data.data;
    },
};
