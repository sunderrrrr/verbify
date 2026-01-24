'use client';
import {zodResolver} from '@hookform/resolvers/zod';
import {Alert, Box, Button, Container, Link, Stack, TextField, Typography} from '@mui/material';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import apiClient from '../../_config/api';
import {useAuthStore} from '../../_stores/authStore';
import {motion} from 'framer-motion';
import NextLink from 'next/link';
import theme from '../../_config/theme';
import config from '../../_config/app';
import Image from "next/image";
import {useRouter} from 'next/navigation';
import React from "react";

const schema = z.object({
    email: z.string().email('Неправильная почта').min(1, 'Required'),
    password: z.string().min(8, 'Минимум 8 символов'),
});

const MotionButton = motion.create(Button);

export default function LoginPage() {
    const { setAuth } = useAuthStore();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const onSubmit = async (data: any) => {
        setErrorMessage(null); // Сброс ошибки перед новым запросом
        try {
            const response = await apiClient.post(config.api.endpoints.login, data);

            // Проверяем ответ API
            if (response.data.result === 'sign in failed') {
                setErrorMessage('Пароль неверный или пользователя не существует 🤔');
                return;
            }

            // Если успех
            setAuth(response.data.token);

            router.push('/');
        } catch (error) {
            console.error('Ошибка логина:', error);
            setErrorMessage('Пароль неверный или пользователя не существует 🤔');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 3,
                }}
            >
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        fontWeight: 1000,
                        background: theme.palette.primary.main,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    {process.env.NEXT_PUBLIC_APP_NAME}
                    <Image
                        src="/whyai-logo-primary.png"
                        alt="WhyAI Logo"
                        width={65}
                        height={65}
                        priority
                        style={{
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            margin: 0,
                            padding: 0
                        }}
                    />
                </Typography>

                <Stack component="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Почта"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message?.toString()}
                        sx={{
                            '& .MuiFilledInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.default'
                            }
                        }}
                    />

                    <TextField
                        label="Пароль"
                        type="password"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message?.toString()}
                        sx={{
                            '& .MuiFilledInput-root': {
                                marginBottom: 3,
                                borderRadius: 3,
                                bgcolor: 'background.default'
                            }
                        }}
                    />

                    {errorMessage && (
                        <Alert severity="error" sx={{ mt: -2, mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <MotionButton
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        sx={{
                            height: 48,
                            borderRadius: 3,
                            fontWeight: 600,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {isSubmitting ? 'Входим...' : 'Войти'}
                    </MotionButton>
                    <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                        Ты новенький?{' '}
                        <Link
                            component={NextLink}
                            href="/register"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Зарегистрируйся
                        </Link>
                    </Typography>
                </Stack>
            </Box>
        </Container>
    );
}
