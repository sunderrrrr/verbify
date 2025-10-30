'use client';
import {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    keyframes,
    Snackbar,
    styled,
    Tab,
    Tabs,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Slide from '@mui/material/Slide';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeContainer = styled(Box)(({ theme }) => ({
    animation: `${fadeIn} 0.5s ease-out both`
}));

export default function ProfilePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tab, setTab] = useState(0);

    const [user, setUser] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [goalDialogOpen, setGoalDialogOpen] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const getToken = () =>
        document.cookie.split('; ').find(r => r.startsWith('authToken='))?.split('=')[1] || '';

    const handleError = (err: Error) => {
        console.error(err);
        setError(err.message);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/user/info`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                if (!res.ok) throw new Error('Не удалось загрузить данные пользователя');
                const data = await res.json();
                setUser(data.info);
                setNewGoal(data.info.goal || '');
            } catch (e) {
                handleError(e as Error);
            } finally {
                setLoadingUser(false);
            }
        };

        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/user/subscription/plans`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                if (!res.ok) throw new Error('Не удалось загрузить тарифы');
                const data = await res.json();
                setPlans(data);
            } catch (e) {
                handleError(e as Error);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchUser();
        fetchPlans();
    }, []);

    const handleSaveGoal = () => {
        setUser((prev: any) => ({ ...prev, goal: newGoal }));
        setGoalDialogOpen(false);
    };

    const handleSendReset = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: resetEmail })
            });
            if (!res.ok) throw new Error('Не удалось отправить запрос на сброс');
            setResetDialogOpen(false);
        } catch (e) {
            handleError(e as Error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <FadeContainer>
                <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
                    Профиль и настройки
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    centered
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{ mb: 3 }}
                >
                    <Tab label="Настройки" />
                    <Tab label="Статистика" />
                    <Tab label="Подписка" />
                </Tabs>
            </FadeContainer>

            {/* Настройки */}
            {tab === 0 && (
                <FadeContainer>
                    {loadingUser ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box
                            display="grid"
                            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                            gap={4}
                            width="100%"
                        >
                            {/* Основные данные */}
                            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Основные данные
                                </Typography>
                                <Typography><strong>Имя:</strong> {user?.name}</Typography>
                                <Typography><strong>Почта:</strong> {user?.email}</Typography>
                                <Typography mb={2}><strong>Цель подготовки:</strong> {user?.goal || 'Не указана'}</Typography>
                                <Button variant="outlined" onClick={() => setGoalDialogOpen(true)}>Обновить цель</Button>
                            </Box>

                            {/* Смена пароля */}
                            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Сменить пароль
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => setResetDialogOpen(true)}
                                >
                                    Сбросить пароль
                                </Button>
                            </Box>

                            {/* Уведомления */}
                            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Уведомления
                                </Typography>
                                <FormControlLabel control={<Checkbox disabled />} label="Напоминания (в разработке)" />
                                <FormControlLabel control={<Checkbox disabled />} label="Результаты проверок (в разработке)" />
                            </Box>
                        </Box>
                    )}

                    {/* Диалог цели */}
                    <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)}>
                        <DialogTitle>Обновить цель подготовки</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Новая цель"
                                type="text"
                                fullWidth
                                value={newGoal}
                                onChange={e => setNewGoal(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setGoalDialogOpen(false)}>Отмена</Button>
                            <Button variant="contained" onClick={handleSaveGoal}>Сохранить</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Диалог сброса */}
                    <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
                        <DialogTitle>Сброс пароля</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Введите вашу почту"
                                type="email"
                                fullWidth
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setResetDialogOpen(false)}>Отмена</Button>
                            <Button variant="contained" onClick={handleSendReset}>Отправить</Button>
                        </DialogActions>
                    </Dialog>
                </FadeContainer>
            )}

            {/* Статистика */}
            {tab === 1 && (
                <FadeContainer>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Статистика аккаунта
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        В будущем здесь будут показана ваша статистика подготовки
                    </Typography>
                    <Box position="relative">
                        <Box
                            display="grid"
                            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                            gap={2}
                            sx={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}
                        >
                            <Card><CardContent><Typography>Средний балл</Typography><Typography>--</Typography></CardContent></Card>
                            <Card><CardContent><Typography>Вопросов в чате</Typography><Typography>--</Typography></CardContent></Card>
                            <Card><CardContent><Typography>Проверено сочинений</Typography><Typography>--</Typography></CardContent></Card>
                            <Card><CardContent><Typography>Последнее сочинение</Typography><Typography>--</Typography></CardContent></Card>
                        </Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.secondary"
                            sx={{
                                position: 'absolute',
                                top: '40%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'background.paper',
                                px: 2,
                                borderRadius: 1
                            }}
                        >
                            В разработке
                        </Typography>
                    </Box>
                </FadeContainer>
            )}

            {/* Подписка */}
            {tab === 2 && (
                <FadeContainer>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Тарифные планы
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                       Подписка на сервис - это вынужденная мера, чтобы обеспечивать его работоспособность
                    </Typography>
                    {loadingPlans ? (
                        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                    ) : (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {plans.map(plan => (
                                <Card
                                    key={plan.id}
                                    sx={{
                                        backgroundColor: user?.subscription === plan.name
                                            ? theme.palette.primary.light
                                            : theme.palette.background.paper,
                                        border: user?.subscription === plan.name
                                            ? `2px solid ${theme.palette.primary.main}`
                                            : '1px solid #ccc'
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                            <Typography variant="h6" fontWeight={600}>{plan.name}</Typography>
                                            {user?.subscription === plan.name && <Chip label="Текущий план" color="warning" size="medium" />}
                                        </Box>
                                        <Typography variant="body1" color="text.secondary" mb={2}>
                                            Вопросов к ИИ: {plan.chat_limit} <br/> Проверок сочинений: {plan.essay_limit}
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽/мес`}
                                        </Typography>
                                        <Button variant="contained" sx={{ mt: 2 }} disabled>
                                            В разработке
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </FadeContainer>
            )}

            {/* Ошибки */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Slide}
            >
                <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}