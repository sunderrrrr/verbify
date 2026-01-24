// app/_components/AuthWrapper.tsx
'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {Box, CircularProgress} from '@mui/material';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    const getToken = () =>
        document.cookie.split('; ').find(r => r.startsWith('authToken='))?.split('=')[1] || '';

    useEffect(() => {
        // Страницы, которые доступны без авторизации
        const publicPaths = ['/login', '/register', '/reset', "/landing"];
        const isPublicPath = publicPaths.includes(pathname);

        if (isPublicPath) {
            setIsChecking(false);
            return;
        }

        const checkAuth = async () => {
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('No token');
                }

                const res = await fetch(`${API_BASE_URL}/user/info`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error('Auth failed');
                }

                // Авторизация успешна
                setIsChecking(false);
            } catch (error) {
                // Редирект на логин при ошибке авторизации
                router.push('/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (isChecking) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );

    }

    return <>{children}</>;
}