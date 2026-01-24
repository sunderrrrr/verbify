// app/under-construction/page.tsx
'use client';
import { Box, Typography, Fade } from '@mui/material';
import Image from 'next/image';

export default function UnderConstruction() {
    return (
        <Fade in={true} timeout={1000}>
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: 'background.default'
                }}
            >
                <Image
                    src="/whyai-logo-primary.png" // Путь к вашему логотипу в public
                    alt="Логотип"
                    width={200}
                    height={200}
                    style={{
                        marginBottom: '2rem',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                        animation: 'pulse 2s infinite'
                    }}
                />

                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    Страница в разработке
                </Typography>

                <Typography variant="h6" color="text.secondary">
                    Скоро здесь что-то будет 👀
                </Typography>
            </Box>
        </Fade>
    );
}