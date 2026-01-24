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

export default function TermsOfServicePage() {
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
                        Условия использования
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Добро пожаловать в наш сервис — онлайн-тренажер для подготовки к ЕГЭ по русскому языку с использованием искусственного интеллекта
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Используя данный сервис, вы соглашаетесь с тем, что будете использовать его исключительно в личных образовательных целях. Коммерческое использование материалов запрещено
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Все материалы, рекомендации и результаты, предоставляемые сервисом, являются вспомогательными и не гарантируют достижение определенных результатов на экзаменах
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Администрация сервиса не несет ответственности за последствия использования предоставленных заданий, анализов и рекомендаций
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Запрещено осуществлять любые попытки взлома, нарушения работы сервиса или вмешательства в его функциональность
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.75, fontSize: '1rem' }}>
                        ⭐ Администрация оставляет за собой право в любой момент изменять условия использования без предварительного уведомления
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 5, textAlign: 'center', color: 'text.disabled' }}>
                        Последнее обновление: 7 июля 2025 года
                    </Typography>
                </Box>
            </FadeContainer>
        </Container>
    );
}