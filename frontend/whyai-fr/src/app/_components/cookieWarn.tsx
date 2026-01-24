// components/CookieConsentBanner.tsx
'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Slide } from '@mui/material';
import { Cookie as CookieIcon, Close } from '@mui/icons-material';

const CookieWarning = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setTimeout(() => setVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setVisible(false);
    };

    return (
        <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: 600,
                    width: '90%',
                    bgcolor: 'background.paper',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    zIndex: 1400
                }}
            >
                <Box display="flex" alignItems="center" mb={2}>
                    <CookieIcon color="primary" sx={{ mr: 1.5 }} />
                    <Typography variant="h6">Мы используем cookies</Typography>
                    <Button
                        size="small"
                        onClick={handleDecline}
                        sx={{ ml: 'auto', minWidth: 32 }}
                    >
                        <Close />
                    </Button>
                </Box>

                <Typography variant="body2" mb={2}>
                    Наш сайт использует cookies для обеспечения работы сервиса.
                    Подробнее можно узнать в нашей{' '}
                    <a href="/privacy" style={{ color: 'inherit' }}>
                        Политике конфиденциальности
                    </a>.
                </Typography>

                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAccept}
                    >
                        Принимаю
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDecline}
                    >
                        Отклонить
                    </Button>
                </Box>
            </Box>
        </Slide>
    );
};

export default CookieWarning;