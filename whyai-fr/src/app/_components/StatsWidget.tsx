'use client';

import {
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    LinearProgress,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import {keyframes, styled} from '@mui/material/styles';
import {useEffect, useState} from 'react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeContainer = styled(Box)(({ theme }) => ({
    animation: `${fadeIn} 0.5s ease-out both`
}));

// Типы данных
export interface StatsAnalysisResponse {
    id: number;
    user_id: number;
    essay_avg_rate: number; // 0-22 балла для сочинения
    problematic_themes: string; // Текстовый отчет от ИИ
    most_clickable_theme: number; // 1-4
}

interface APIResponse {
    result: StatsAnalysisResponse;
    status?: string;
    error?: string;
}

interface StatsWidgetProps {
    compact?: boolean;
    showRefresh?: boolean;
    themeLabels?: string[];
    onViewDetails?: () => void;
}

// Мок-данные для разработки
const MOCK_STATS: StatsAnalysisResponse = {
    id: 1,
    user_id: 1,
    essay_avg_rate: 17.5,
    problematic_themes: "Пользователь демонстрирует хорошее понимание лексики и орфографии, но испытывает трудности с пунктуацией в сложных предложениях. Рекомендуется уделить больше внимания правилам расстановки запятых в причастных и деепричастных оборотах.",
    most_clickable_theme: 2 // 1 = Лексика, 2 = Орфография, 3 = Пунктуация, 4 = Текст
};

// Компонент для отображения изменения балла
const ScoreChangeIndicator = ({ current, previous }: { current: number; previous?: number }) => {
    if (!previous || previous === current) {
        return (
            <Box display="flex" alignItems="center" color="text.secondary">
                <EqualizerIcon fontSize="small" />
                <Typography variant="body2" ml={0.5} fontSize="0.75rem">стабильно</Typography>
            </Box>
        );
    }

    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);

    if (change > 0) {
        return (
            <Box display="flex" alignItems="center" color="success.main">
                <TrendingUpIcon fontSize="small" />
                <Typography variant="body2" ml={0.5} fontSize="0.75rem">+{percentChange}%</Typography>
            </Box>
        );
    } else {
        return (
            <Box display="flex" alignItems="center" color="error.main">
                <TrendingDownIcon fontSize="small" />
                <Typography variant="body2" ml={0.5} fontSize="0.75rem">{percentChange}%</Typography>
            </Box>
        );
    }
};

export default function StatsWidget({
                                        compact = false,
                                        showRefresh = true,
                                        themeLabels = ["📒 Лексика", "🖊️ Орфография", "📃 Пунктуация", "📖 Текст"],
                                        onViewDetails
                                    }: StatsWidgetProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [stats, setStats] = useState<StatsAnalysisResponse | null>(null);
    const [previousScore, setPreviousScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Функция для получения токена из куки
    const getAuthToken = (): string => {
        if (typeof document === 'undefined') return '';
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(cookie => cookie.startsWith('authToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : '';
    };

    // Функция для получения данных из API
    const fetchStats = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${apiUrl}/user/analyze`, {
                method: 'GET',
                headers,
                cache: forceRefresh ? 'no-cache' : 'default'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse: APIResponse = await response.json();

            // Проверяем структуру ответа
            if (!apiResponse.result) {
                throw new Error('Некорректный формат ответа от сервера');
            }

            const data = apiResponse.result;

            // Сохраняем предыдущий результат для сравнения
            const cachedScore = localStorage.getItem('previous_essay_score');
            if (cachedScore) {
                setPreviousScore(parseFloat(cachedScore));
            }

            // Сохраняем текущий результат для следующего сравнения
            localStorage.setItem('previous_essay_score', data.essay_avg_rate.toString());

            setStats(data);
            setLastUpdated(new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }));

        } catch (err) {
            console.error('Error fetching stats:', err);

            let errorMessage = 'Не удалось загрузить статистику';
            if (err instanceof Error) {
                if (err.message.includes('HTTP error')) {
                    errorMessage = 'Ошибка подключения к серверу';
                } else if (err.message.includes('Некорректный формат')) {
                    errorMessage = 'Некорректные данные от сервера';
                }
            }

            setError(errorMessage);

            // В случае ошибки показываем мок-данные только если у нас нет сохраненных данных
            if (!stats) {
                setStats(MOCK_STATS);
            }
        } finally {
            setLoading(false);
        }
    };

    // Загружаем данные при монтировании
    useEffect(() => {
        fetchStats();
    }, []);

    // Обработчик обновления статистики
    const handleRefresh = async () => {
        await fetchStats(true);
    };

    if (loading && !stats) {
        return (
            <Card sx={{
                p: 3,
                textAlign: 'center',
                minHeight: compact ? 200 : 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" mt={2}>
                    Загружаем статистику...
                </Typography>
            </Card>
        );
    }

    if (!stats) {
        return (
            <Card sx={{
                p: 3,
                textAlign: 'center',
                minHeight: compact ? 200 : 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Нет данных статистики
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {loading ? 'Загрузка...' : 'Загрузить статистику'}
                </Button>
            </Card>
        );
    }

    // Форматирование балла (0-22) в проценты для ЕГЭ сочинения
    const scorePercentage = (stats.essay_avg_rate / 22) * 100;

    // Получение названия самой популярной темы
    const getThemeName = () => {
        const index = stats.most_clickable_theme - 1;
        return themeLabels[index] || `Тема ${stats.most_clickable_theme}`;
    };

    // Сокращение текста анализа для компактного режима
    const getShortAnalysis = (text: string) => {
        if (compact) {
            return text.length > 100 ? text.substring(0, 100) + '...' : text;
        }
        return text;
    };

    // Определение цвета прогресс-бара в зависимости от балла
    const getProgressColor = (score: number) => {
        const percentage = (score / 22) * 100;
        if (percentage >= 80) return 'success';      // 17.6+ баллов - отлично
        if (percentage >= 60) return 'warning';      // 13.2+ баллов - хорошо
        if (percentage >= 40) return 'info';         // 8.8+ баллов - удовлетворительно
        return 'error';                              // менее 8.8 баллов - плохо
    };

    // Получение текстовой оценки
    const getScoreRating = (score: number) => {
        const percentage = (score / 22) * 100;
        if (percentage >= 80) return 'Отлично';
        if (percentage >= 60) return 'Хорошо';
        if (percentage >= 40) return 'Удовлетворительно';
        return 'Требует улучшения';
    };

    return (
        <FadeContainer>
            <Card
                sx={{
                    p: compact ? 2 : 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    minHeight: compact ? 250 : 350
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={compact ? 1 : 2}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            📊 Статистика ЕГЭ (Сочинение)
                        </Typography>
                        {!compact && lastUpdated && (
                            <Typography variant="caption" color="text.secondary">
                                Обновлено: {lastUpdated}
                            </Typography>
                        )}
                    </Box>

                    {showRefresh && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleRefresh}
                            disabled={loading}
                            sx={{ minWidth: 'auto' }}
                            startIcon={loading ? <CircularProgress size={16} /> : undefined}
                        >
                            {loading ? '' : '↻'}
                        </Button>
                    )}
                </Box>

                {error && (
                    <Typography color="error" variant="body2" mb={2}>
                        ⚠️ {error} (используются демо-данные)
                    </Typography>
                )}

                {/* Основной балл */}
                <Box mb={compact ? 2 : 3}>
                    <Box display="flex" alignItems="baseline" mb={1} flexWrap="wrap">
                        <Typography
                            variant={compact ? "h5" : "h4"}
                            fontWeight={700}
                            mr={2}
                            color={getProgressColor(stats.essay_avg_rate)}
                        >
                            {stats.essay_avg_rate.toFixed(1)}/22
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <Chip
                                label={getScoreRating(stats.essay_avg_rate)}
                                size="small"
                                color={getProgressColor(stats.essay_avg_rate) as any}
                                variant="outlined"
                                sx={{ mr: 1, fontWeight: 500 }}
                            />
                            <ScoreChangeIndicator
                                current={stats.essay_avg_rate}
                                previous={previousScore || undefined}
                            />
                        </Box>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={scorePercentage}
                        color={getProgressColor(stats.essay_avg_rate)}
                        sx={{
                            height: compact ? 6 : 8,
                            borderRadius: 4,
                            mb: 1
                        }}
                    />

                    <Typography variant="caption" color="text.secondary">
                        Средний балл по сочинениям ЕГЭ
                    </Typography>
                </Box>

                {!compact && (
                    <>
                        <Box mb={3}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                🏆 Самая изучаемая тема
                            </Typography>
                            <Chip
                                label={getThemeName()}
                                color="primary"
                                variant="filled"
                                size="medium"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </Box>

                        <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                📈 Анализ динамики:
                            </Typography>
                        </Box>
                    </>
                )}

                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: compact ? '0.875rem' : '1rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {getShortAnalysis(stats.problematic_themes)}
                    </Typography>
                </Box>

                {!compact && onViewDetails && (
                    <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                        <Button
                            variant="text"
                            size="small"
                            onClick={onViewDetails}
                            fullWidth
                        >
                            Подробная статистика →
                        </Button>
                    </Box>
                )}
            </Card>
        </FadeContainer>
    );
}