import apiClient from './apiClient';
export const searchService = {
    async globalSearch(query) {
        const response = await apiClient.get('/search/global', { params: { q: query } });
        return response.data.data;
    },
};
