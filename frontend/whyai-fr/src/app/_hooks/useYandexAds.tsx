import { useEffect } from 'react';

declare global {
    interface Window {
        Ya?: any;
    }
}

export const useYandexAds = () => {
    useEffect(() => {
        const loadScript = () => {
            if (!document.querySelector('script[src*="context.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://yandex.ru/ads/system/context.js';
                script.async = true;
                document.body.appendChild(script);
            }
        };

        if (typeof window !== 'undefined' && !window.Ya) {
            loadScript();
        }
    }, []);
};