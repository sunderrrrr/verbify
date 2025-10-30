import axios from 'axios';
import config from './app';

const apiClient = axios.create({
    baseURL: config.api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для запросов - вывод в консоль при отправке
apiClient.interceptors.request.use(
    (request) => {

        return request;
    },
    (error) => {
        console.error('❌ Ошибка при подготовке запроса:', error);
        return Promise.reject(error);
    }
);

// Интерцептор для ответов
// Интерцептор для ответов
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Просто возвращаем оригинальную ошибку без изменений
        return Promise.reject(error);
    }
);
export default apiClient;