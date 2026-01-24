'use client';
import {Button} from '@mui/material';
import {useRouter} from 'next/navigation';
import {Person2Outlined} from '@mui/icons-material';

export function UserButton() {
    const router = useRouter();


    const handleUser = () => {
        router.push('/profile');
    };

    // @ts-ignore
    return (
        <Button
            variant="text"
            startIcon={<Person2Outlined fontSize="small" />}
            onClick={handleUser}
            sx={{
                color: 'text.primary',
                textTransform: 'none',
                '&:hover': {
                    backgroundColor: 'errorContainer.main',
                    color: 'onErrorContainer.main'
                }
            }}
        >

        </Button>
    );
}