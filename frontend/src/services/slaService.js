import apiClient from './apiClient';
export const slaService = {
    async getPolicies() {
        const response = await apiClient.get('/sla');
        return response.data.data;
    },
    async createPolicy(data) {
        const response = await apiClient.post('/sla', data);
        return response.data.data;
    },
    async updatePolicy(id, data) {
        const response = await apiClient.patch(`/sla/${id}`, data);
        return response.data.data;
    },
};
