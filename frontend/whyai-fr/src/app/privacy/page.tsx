'use client';

import { Container, Typography, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes, styled } from '@mui/material/styles';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeContainer = styled(Box)(({ theme }) => ({
    animation: `${fadeIn} 0.5s ease-out both`,
}));

export default function PrivacyPolicyPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
            <FadeContainer>
                <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 1,
                        p: { xs: 3, sm: 4 },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 4,
                            fontSize: isMobile ? '1.75rem' : '2.25rem',
                            color: 'text.primary'
                        }}
                    >
                        Политика конфиденциальности
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Добро пожаловать в Verbify - наш онлайн-тренажер для подготовки к ЕГЭ по русскому языку с применением искусственного интеллекта
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Мы ценим вашу конфиденциальность и не собираем никаких персональных данных, кроме вашего имени и адреса электронной почты, необходимых для регистрации и входа в сервис
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Все задания и анализы выполняются с использованием модели искусственного интеллекта DeepSeek. Ваши ответы и тексты
                        не сохраняются на наших серверах, за исключение истории переписки для учета контекста переписки с чат-ботом
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Мы используем cookies исключительно для авторизации и повышения удобства использования сервиса
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Продолжая использовать наш сервис, вы автоматически соглашаетесь с настоящей политикой конфиденциальности
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 5, textAlign: 'center', color: 'text.disabled' }}>
                        Последнее обновление: 7 июля 2025 года
                    </Typography>
                </Box>
            </FadeContainer>
        </Container>
    );
}