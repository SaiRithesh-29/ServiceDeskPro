import apiClient from './apiClient';
export const ticketService = {
    async getTickets(params) {
        const response = await apiClient.get('/tickets', { params });
        return response.data;
    },
    async getTicketById(id) {
        const response = await apiClient.get(`/tickets/${id}`);
        return response.data.data;
    },
    async createTicket(data) {
        const response = await apiClient.post('/tickets', data);
        return response.data.data;
    },
    async updateTicket(id, data) {
        const response = await apiClient.patch(`/tickets/${id}`, data);
        return response.data.data;
    },
    async updateStatus(id, status, resolutionNotes) {
        const response = await apiClient.post(`/tickets/${id}/status`, { status, resolutionNotes });
        return response.data.data;
    },
    async assignTicket(id, technicianId, teamId) {
        const response = await apiClient.post(`/tickets/${id}/assign`, { technicianId, teamId });
        return response.data.data;
    },
    async escalateTicket(id, reason) {
        const response = await apiClient.post(`/tickets/${id}/escalate`, { reason });
        return response.data.data;
    },
    async resolveTicket(id, resolutionNotes) {
        const response = await apiClient.post(`/tickets/${id}/resolve`, { resolutionNotes });
        return response.data.data;
    },
    async reopenTicket(id) {
        const response = await apiClient.post(`/tickets/${id}/reopen`);
        return response.data.data;
    },
    async addComment(id, content, isInternal = false, attachments = []) {
        const response = await apiClient.post(`/tickets/${id}/comments`, { content, isInternal, attachments });
        return response.data.data;
    },
    async addWorkLog(id, timeSpentMinutes, description) {
        const response = await apiClient.post(`/tickets/${id}/work-logs`, { timeSpentMinutes, description });
        return response.data.data;
    },
    async deleteTicket(id) {
        const response = await apiClient.delete(`/tickets/${id}`);
        return response.data;
    },
};
