'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../_stores/authStore';

export default function AuthInit() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return null;
}
