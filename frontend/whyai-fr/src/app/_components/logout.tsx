'use client';
import {Button} from '@mui/material';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '../_stores/authStore';
import {Logout} from '@mui/icons-material';

export function LogoutButton() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };
    
    return (
        <Button
            variant="text"

            startIcon={<Logout fontSize="small" />}
            onClick={handleLogout}
            sx={{
                color:'text.primary',
                textTransform: 'none',
                '&:hover': {
                    backgroundColor: 'errorContainer.main',

                }
            }}
        >

        </Button>
    );
}