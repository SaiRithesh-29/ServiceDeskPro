import apiClient from './apiClient';
export const teamService = {
    async getTeams() {
        const response = await apiClient.get('/teams');
        return response.data.data;
    },
    async createTeam(data) {
        const response = await apiClient.post('/teams', data);
        return response.data.data;
    },
    async getDepartments() {
        const response = await apiClient.get('/settings/departments');
        return response.data.data;
    },
    async createDepartment(data) {
        const response = await apiClient.post('/settings/departments', data);
        return response.data.data;
    },
};
