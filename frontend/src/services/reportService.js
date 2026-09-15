import apiClient from './apiClient';
export const reportService = {
    async getDashboardMetrics() {
        const response = await apiClient.get('/reports/dashboard');
        return response.data.data;
    },
    async getTicketsByStatus(startDate, endDate) {
        const response = await apiClient.get('/reports/tickets/by-status', { params: { startDate, endDate } });
        return response.data.data;
    },
    async getTicketsByPriority(startDate, endDate) {
        const response = await apiClient.get('/reports/tickets/by-priority', { params: { startDate, endDate } });
        return response.data.data;
    },
    async getTicketsByCategory() {
        const response = await apiClient.get('/reports/tickets/by-category');
        return response.data.data;
    },
    async getTicketsByDepartment() {
        const response = await apiClient.get('/reports/tickets/by-department');
        return response.data.data;
    },
    async getTechnicianWorkload() {
        const response = await apiClient.get('/reports/technician-workload');
        return response.data.data;
    },
    async getSLACompliance() {
        const response = await apiClient.get('/reports/sla/compliance');
        return response.data.data;
    },
    async getVolumeTrend() {
        const response = await apiClient.get('/reports/tickets/volume-trend');
        return response.data.data;
    },
    async getResolutionTime() {
        const response = await apiClient.get('/reports/tickets/resolution-time');
        return response.data.data;
    },
    async getAssetDistribution() {
        const response = await apiClient.get('/reports/assets/distribution');
        return response.data.data;
    },
    async getAssetStatus() {
        const response = await apiClient.get('/reports/assets/status');
        return response.data.data;
    },
    async getWarrantyStatus() {
        const response = await apiClient.get('/reports/assets/warranty');
        return response.data.data;
    },
    getExportUrl(type) {
        const token = localStorage.getItem('accessToken') || '';
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        return `${baseUrl}/reports/export?type=${type}&token=${token}`;
    },
};
