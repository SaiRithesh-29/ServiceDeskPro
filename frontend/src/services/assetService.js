import apiClient from './apiClient';
export const assetService = {
    async getAssets(params) {
        const response = await apiClient.get('/assets', { params });
        return response.data;
    },
    async getAssetById(id) {
        const response = await apiClient.get(`/assets/${id}`);
        return response.data.data;
    },
    async createAsset(data) {
        const response = await apiClient.post('/assets', data);
        return response.data.data;
    },
    async updateAsset(id, data) {
        const response = await apiClient.patch(`/assets/${id}`, data);
        return response.data.data;
    },
    async assignAsset(id, userId, departmentId, location) {
        const response = await apiClient.post(`/assets/${id}/assign`, { userId, departmentId, location });
        return response.data.data;
    },
    async unassignAsset(id, reason) {
        const response = await apiClient.post(`/assets/${id}/unassign`, { reason });
        return response.data.data;
    },
    async updateStatus(id, status, notes) {
        const response = await apiClient.post(`/assets/${id}/status`, { status, notes });
        return response.data.data;
    },
    async deleteAsset(id) {
        const response = await apiClient.delete(`/assets/${id}`);
        return response.data;
    },
};
