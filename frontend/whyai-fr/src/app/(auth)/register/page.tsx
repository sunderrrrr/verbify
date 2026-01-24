'use client';
import {zodResolver} from '@hookform/resolvers/zod';
import {Alert, Box, Button, Container, Link, Stack, TextField, Typography} from '@mui/material';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {motion} from 'framer-motion';
import NextLink from 'next/link';
import apiClient from '../../_config/api';
import config from '../../_config/app';
import Image from "next/image";
import theme from "@/app/_config/theme";
import {useState} from 'react';

const schema = z.object({
    email: z.string().email('Некорректный email').min(1, 'Обязательное поле'),
    password: z.string()
        .min(8, 'Минимум 8 символов')
        .regex(/[A-Z]/, 'Должна быть заглавная буква')
        .regex(/[0-9]/, 'Должна быть цифра'),
    name: z.string().min(1, 'Обязательное поле'),
});

const MotionButton = motion(Button);
const MotionBox = motion(Box);

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSubmit = async (data: any) => {
        setErrorMessage(null);
        try {
            await apiClient.post(config.api.endpoints.register, data);
            window.location.href = '/login';
        } catch (error: any) {
        if (error?.response?.data?.result === "antifraud denied registration") {
            setErrorMessage('Регистрация отклонена системой безопасности');
        } else if (error?.response?.data?.result === "user exists") {
            setErrorMessage('Ошибка регистрации: Возможно пользователь с таким email уже существует 🤔\n Поменяйте данные или подождите');
        } else {
            setErrorMessage('Ошибка регистрации:' + error?.response?.data?.result +  '\n Мы уже о ней знаем и работаем над исправлением \n Попробуйте позже');
        }
    }
    };

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: -60,
                        left: -60,
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.light',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                        zIndex: -1,
                    }
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

                <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
                    {!!errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <TextField
                        label="Email"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message?.toString()}
                        sx={{
                            '& .MuiFilledInput-root': {
                                borderRadius: 2,
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
                                borderRadius: 2,
                                bgcolor: 'background.default'
                            }
                        }}
                    />

                    <TextField
                        label="Имя"
                        type="text"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message?.toString()}
                        sx={{
                            '& .MuiFilledInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.default'
                            }
                        }}
                    />

                    <MotionButton
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: '0 4px 12px rgba(103, 80, 164, 0.2)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        sx={{
                            height: 48,
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                ↻
                            </motion.span>
                        ) : (
                            'Зарегистрироваться'
                        )}
                    </MotionButton>

                    <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                        Уже есть аккаунт?{' '}
                        <Link
                            component={NextLink}
                            href="/login"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Войти
                        </Link>
                    </Typography>
                </Stack>
            </MotionBox>
        </Container>
    );
}