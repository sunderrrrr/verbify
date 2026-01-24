import {create} from 'zustand';
import Cookies from 'js-cookie';

type AuthState = {
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (token: string) => void;
    logout: () => void;
    initialize: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    isAuthenticated: false,

    initialize: () => {
        const token = Cookies.get('authToken');
        if (token) {
            set({ token, isAuthenticated: true });
        }
    },

    setAuth: (token: string) => {
        try {
            // Сохраняем в куки
            Cookies.set('authToken', token, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            // Проверяем сохранение
            const savedToken = Cookies.get('authToken');
            // Обновляем состояние
            set({ token, isAuthenticated: true });
        } catch (error) {
            console.error('Ошибка сохранения токена:', error);
        }
    },

    logout: () => {
        Cookies.remove('authToken', { path: '/' });
        set({ token: null, isAuthenticated: false });
    }
}));