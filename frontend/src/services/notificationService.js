import apiClient from './apiClient';
export const notificationService = {
    async getNotifications(params) {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },
    async markAsRead(id) {
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data.data;
    },
    async markAllAsRead() {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data.data;
    },
    async deleteNotification(id) {
        const response = await apiClient.delete(`/notifications/${id}`);
        return response.data;
    },
};
