import apiClient from './apiClient';
export const aiService = {
    async classifyTicket(title, description) {
        const response = await apiClient.post('/ai/classify', { title, description });
        return response.data.data;
    },
    async suggestKB(title, description, category) {
        const response = await apiClient.post('/ai/suggest-kb', { title, description, category });
        return response.data.data;
    },
};
