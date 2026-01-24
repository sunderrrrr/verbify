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
    LinearProgress,
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeContainer = styled(Box)(({ theme }) => ({
    animation: `${fadeIn} 0.5s ease-out both`
}));

// Типы для статистики
interface StatsAnalysisResponse {
    id: number;
    user_id: number;
    essay_avg_rate: number;
    problematic_themes: string;
    most_clickable_theme: number;
}

interface CachedStats {
    data: StatsAnalysisResponse;
    timestamp: number;
    previousAvg?: number;
}

// Компонент для отображения изменения балла
const ScoreChangeIndicator = ({ current, previous }: { current: number; previous?: number }) => {
    if (!previous || previous === current) {
        return (
            <Box display="flex" alignItems="center" color="text.secondary">
                <EqualizerIcon fontSize="small" />
                <Typography variant="body2" ml={0.5}>без изменений</Typography>
            </Box>
        );
    }

    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);

    if (change > 0) {
        return (
            <Box display="flex" alignItems="center" color="success.main">
                <TrendingUpIcon fontSize="small" />
                <Typography variant="body2" ml={0.5}>+{percentChange}%</Typography>
            </Box>
        );
    } else {
        return (
            <Box display="flex" alignItems="center" color="error.main">
                <TrendingDownIcon fontSize="small" />
                <Typography variant="body2" ml={0.5}>{percentChange}%</Typography>
            </Box>
        );
    }
};

// Компонент для прогресс-бара темы
const ThemeProgress = ({ theme, score }: { theme: string; score: number }) => {
    const getColor = (score: number) => {
        if (score >= 4) return 'success';
        if (score >= 3) return 'warning';
        return 'error';
    };

    return (
        <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{theme}</Typography>
                <Typography variant="body2" fontWeight="bold">
                    {score.toFixed(1)}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={score * 20} // Конвертируем 5-балльную шкалу в проценты
                color={getColor(score)}
                sx={{ height: 8, borderRadius: 4 }}
            />
        </Box>
    );
};

export default function ProfilePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tab, setTab] = useState(0);

    const [user, setUser] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const [stats, setStats] = useState<StatsAnalysisResponse | null>(null);
    const [previousAvg, setPreviousAvg] = useState<number | null>(null);

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

    // Загрузка кэшированной статистики
    const loadCachedStats = (): CachedStats | null => {
        if (typeof window === 'undefined') return null;
        const cached = localStorage.getItem('user_stats');
        if (!cached) return null;

        try {
            return JSON.parse(cached);
        } catch {
            return null;
        }
    };

    // Сохранение статистики в кэш
    const saveStatsToCache = (data: StatsAnalysisResponse, previousAvg?: number) => {
        if (typeof window === 'undefined') return;

        const cacheData: CachedStats = {
            data,
            timestamp: Date.now(),
            previousAvg
        };

        localStorage.setItem('user_stats', JSON.stringify(cacheData));
    };

    // Запрос анализа статистики
    const handleAnalyzeStats = async () => {
        setLoadingAnalysis(true);
        try {
            const res = await fetch(`${API_BASE_URL}/user/analyze`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (!res.ok) throw new Error('Не удалось проанализировать статистику');

            const analysisData: StatsAnalysisResponse = await res.json();

            // Получаем предыдущее среднее значение из кэша
            const cached = loadCachedStats();
            const previousAverage = cached?.data.essay_avg_rate;

            setStats(analysisData);
            setPreviousAvg(previousAverage || null);

            // Сохраняем новую статистику в кэш
            saveStatsToCache(analysisData, previousAverage);

        } catch (e) {
            handleError(e as Error);
        } finally {
            setLoadingAnalysis(false);
        }
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
                // Устанавливаем email для сброса пароля
                setResetEmail(data.info.email || '');
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

        // Загружаем кэшированную статистику при монтировании
        const cachedStats = loadCachedStats();
        if (cachedStats) {
            setStats(cachedStats.data);
            setPreviousAvg(cachedStats.previousAvg || null);
        }

        fetchUser();
        fetchPlans();
    }, []);

    const handleSaveGoal = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goal: newGoal })
            });

            if (!res.ok) throw new Error('Не удалось обновить цель');

            setUser((prev: any) => ({ ...prev, goal: newGoal }));
            setGoalDialogOpen(false);
        } catch (e) {
            handleError(e as Error);
        }
    };

    const handleSendReset = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: resetEmail })
            });
            if (!res.ok) throw new Error('Не удалось отправить запрос на сброс');
            setResetDialogOpen(false);
            setError('Инструкции по сбросу пароля отправлены на вашу почту');
            setSnackbarOpen(true);
        } catch (e) {
            handleError(e as Error);
        }
    };

    // Парсинг проблемных тем из строки
    const parseProblematicThemes = (themesString: string | undefined | null): string[] => {
        if (!themesString) return [];
        try {
            return JSON.parse(themesString);
        } catch {
            return themesString.split(',').map(theme => theme.trim()).filter(theme => theme.length > 0);
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
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    allowScrollButtonsMobile={isMobile}
                    scrollButtons="auto"
                    sx={{ mb: 3 }}
                >
                    <Tab label="Настройки" />
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
                                <Typography><strong>Имя:</strong> {user?.name || 'Не указано'}</Typography>
                                <Typography><strong>Почта:</strong> {user?.email || 'Не указана'}</Typography>
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
                                placeholder="Например: Подготовка к ЕГЭ по литературе"
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
            
            {/* Подписка */}
            {tab === 1 && (
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
                <Alert
                    severity={error?.includes('Инструкции') ? 'success' : 'error'}
                    sx={{ width: '100%', borderRadius: 2 }}
                    onClose={() => setSnackbarOpen(false)}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}