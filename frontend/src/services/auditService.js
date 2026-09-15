import apiClient from './apiClient';
export const auditService = {
    async getAuditLogs(params) {
        const response = await apiClient.get('/audit-logs', { params });
        return response.data;
    },
};
