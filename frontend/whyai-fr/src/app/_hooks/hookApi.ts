import { useAuthStore } from '../_stores/authStore';
import apiClient from '../_config/api';

export const useApi = () => {
    const { token } = useAuthStore();

    const authenticatedApi = async (config: any) => {
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return apiClient(config);
    };

    return {
        get: (url: string) => authenticatedApi({ method: 'get', url }),
        post: (url: string, data?: any) => authenticatedApi({ method: 'post', url, data }),
        put: (url: string, data?: any) => authenticatedApi({ method: 'put', url, data }),
        delete: (url: string) => authenticatedApi({ method: 'delete', url }),
    };
};