'use client';

import {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    keyframes,
    Paper,
    styled,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {useRouter, useSearchParams} from 'next/navigation';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadePaper = styled(Paper)(({ theme }) => ({
    animation: `${fadeInUp} 0.6s ease-out both`,
    padding: theme.spacing(5),
    borderRadius: 8 * 2,
    maxWidth: 480,
    margin: 'auto',
    boxShadow: theme.shadows[8],
    backgroundColor: theme.palette.background.paper,
}));

export default function ResetPasswordPage() {
    const theme = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get('t') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setError('');
    }, [password, confirmPassword]);

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        if (!token) {
            setError('Токен сброса пароля отсутствует или недействителен.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Имитация API-запроса
            await new Promise((res) => setTimeout(res, 1600));

            setSuccess(true);

            setTimeout(() => router.push('/login'), 2500);
        } catch {
            setError('Не удалось сбросить пароль. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: theme.palette.background.paper || theme.palette.background.default,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 6,
                mb: 5,
            }}
        >
            <FadePaper elevation={4}>
                <Typography
                    variant="h5"
                    component="h1"
                    fontWeight={700}
                    textAlign="center"
                    gutterBottom
                    sx={{ color: theme.palette.text.primary , pb: 2}}
                >
                    Сброс пароля
                </Typography>

                {!token ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        Токен сброса пароля отсутствует или недействителен.
                    </Alert>
                ) : success ? (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Пароль успешно изменён! Сейчас вы будете перенаправлены на страницу входа.
                    </Alert>
                ) : (
                    <>
                        <TextField
                            type="password"
                            label="Новый пароль"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            sx={{
                                mb: 3,
                                '& .MuiInputBase-root': {
                                    borderRadius: 2,
                                },
                            }}
                            autoFocus
                        />
                        <TextField
                            type="password"
                            label="Подтвердите пароль"
                            variant="outlined"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!!error}
                            helperText={error}
                            disabled={loading}
                            sx={{
                                mb: 4,
                                '& .MuiInputBase-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={
                                loading || !password || !confirmPassword || password !== confirmPassword
                            }
                            onClick={handleSubmit}
                            sx={{
                                borderRadius: 2,
                                py: 1.8,
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: loading ? 'none' : undefined,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: loading ? 'none' : 'translateY(-2px)',
                                    boxShadow: loading ? 'none' : theme.shadows[6],
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Сменить пароль'
                            )}
                        </Button>
                    </>
                )}
            </FadePaper>
        </Box>
    );
}
