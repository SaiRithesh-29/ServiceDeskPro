import apiClient from './apiClient';
export const kbService = {
    async getArticles(params) {
        const response = await apiClient.get('/knowledge-base', { params });
        return response.data;
    },
    async getArticleById(id) {
        const response = await apiClient.get(`/knowledge-base/${id}`);
        return response.data.data;
    },
    async createArticle(data) {
        const response = await apiClient.post('/knowledge-base', data);
        return response.data.data;
    },
    async updateArticle(id, data) {
        const response = await apiClient.patch(`/knowledge-base/${id}`, data);
        return response.data.data;
    },
    async voteArticle(id, isHelpful) {
        const response = await apiClient.post(`/knowledge-base/${id}/vote`, { isHelpful });
        return response.data.data;
    },
    async getCategories() {
        const response = await apiClient.get('/knowledge-base/categories');
        return response.data.data;
    },
    async deleteArticle(id) {
        const response = await apiClient.delete(`/knowledge-base/${id}`);
        return response.data;
    },
};
