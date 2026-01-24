'use client';

import {
    Alert,
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
import WarningIcon from '@mui/icons-material/Warning';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import PsychologyIcon from '@mui/icons-material/Psychology';
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
    essay_avg_rate: number;
    problematic_themes: string;
    most_clickable_theme: number;
}

interface APIResponse {
    result?: StatsAnalysisResponse | string;
    status?: string;
    error?: string;
    message?: string;
}

interface StatsWidgetProps {
    compact?: boolean;
    showRefresh?: boolean;
    themeLabels?: string[];
    onViewDetails?: () => void;
}

// Состояния виджета
type WidgetState = 'loading' | 'data' | 'no-data' | 'error' | 'insufficient-data';

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

// Компонент для состояния "недостаточно данных"
const InsufficientDataState = ({ message, onRetry, compact }: {
    message: string;
    onRetry: () => void;
    compact?: boolean
}) => {
    const theme = useTheme();

    return (
        <Card sx={{
            p: compact ? 2 : 3,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            border: `1px dashed ${theme.palette.divider}`,
            textAlign: 'center'
        }}>
            <Box mb={2}>
                <PsychologyIcon
                    sx={{
                        fontSize: compact ? 40 : 60,
                        color: 'primary.main',
                        mb: 1
                    }}
                />
            </Box>

            <Typography variant={compact ? "h6" : "h5"} fontWeight={600} mb={1}>
                📝 Недостаточно данных
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={compact ? 2 : 3}>
                {message === "not enough data to analyze"
                    ? "Для анализа статистики необходимо решить больше заданий. Попробуйте позже или начните заниматься прямо сейчас!"
                    : message === "metrics data is nil"
                        ? "Данные для анализа отсутствуют. Начните решать задания, чтобы получить персональную статистику."
                        : message}
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onRetry}
                    sx={{ mb: 1 }}
                >
                    Проверить снова
                </Button>

                {!compact && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Что делать:
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" display="flex" alignItems="center">
                                ✓ Решите минимум 4 темы для анализа
                            </Typography>
                            <Typography variant="caption" display="flex" alignItems="center">
                                ✓ Попробуйте разные разделы подготовки
                            </Typography>
                            <Typography variant="caption" display="flex" alignItems="center">
                                ✓ Вернитесь через некоторое время
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        </Card>
    );
};

// Компонент для состояния ошибки
const ErrorState = ({ error, onRetry, compact }: {
    error: string;
    onRetry: () => void;
    compact?: boolean
}) => {
    const theme = useTheme();

    return (
        <Card sx={{
            p: compact ? 2 : 3,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            border: `1px solid ${theme.palette.error.light}`,
            textAlign: 'center'
        }}>
            <Box mb={2}>
                <WarningIcon
                    sx={{
                        fontSize: compact ? 40 : 60,
                        color: 'error.main',
                        mb: 1
                    }}
                />
            </Box>

            <Typography variant={compact ? "h6" : "h5"} fontWeight={600} mb={1}>
                ⚠️ Ошибка загрузки
            </Typography>

            <Alert
                severity="error"
                sx={{ mb: 2, justifyContent: 'center' }}
                icon={false}
            >
                <Typography variant="body2">
                    {error}
                </Typography>
            </Alert>

            <Button
                variant="outlined"
                color="error"
                onClick={onRetry}
                startIcon={<CircularProgress size={16} />}
                sx={{ mb: 1 }}
            >
                Попробовать снова
            </Button>

            {!compact && (
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Если ошибка повторяется, обратитесь в поддержку
                </Typography>
            )}
        </Card>
    );
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
    const [widgetState, setWidgetState] = useState<WidgetState>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Функция для получения токена из куки
    const getAuthToken = (): string => {
        if (typeof document === 'undefined') return '';
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(cookie => cookie.startsWith('authToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : '';
    };

    // Функция для определения типа ответа и состояния
    const determineWidgetState = (apiResponse: APIResponse, statusCode: number): WidgetState => {
        // Если сервер вернул ошибку 500
        if (statusCode === 500) {
            // Проверяем сообщения об отсутствии данных
            if (typeof apiResponse.result === 'string') {
                const message = apiResponse.result.toLowerCase();
                if (message.includes('not enough data') || message.includes('metrics data is nil')) {
                    return 'insufficient-data';
                }
            }
            if (apiResponse.error || apiResponse.message) {
                const errorMsg = (apiResponse.error || apiResponse.message || '').toLowerCase();
                if (errorMsg.includes('not enough data') || errorMsg.includes('metrics data is nil')) {
                    return 'insufficient-data';
                }
            }
            return 'error';
        }

        // Если есть корректные данные
        if (apiResponse.result && typeof apiResponse.result === 'object') {
            return 'data';
        }

        // Если результат - строка с сообщением об ошибке
        if (typeof apiResponse.result === 'string') {
            const message = apiResponse.result.toLowerCase();
            if (message.includes('not enough data') || message.includes('metrics data is nil')) {
                return 'insufficient-data';
            }
            return 'error';
        }

        // Если данных нет
        return 'no-data';
    };

    // Функция для получения данных из API
    const fetchStats = async (forceRefresh = false) => {
        setLoading(true);
        setWidgetState('loading');
        setErrorMessage('');

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

            const apiResponse: APIResponse = await response.json();

            // Определяем состояние на основе ответа
            const state = determineWidgetState(apiResponse, response.status);
            setWidgetState(state);

            if (state === 'data') {
                // Успешный ответ с данными
                const data = apiResponse.result as StatsAnalysisResponse;

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
            } else if (state === 'insufficient-data') {
                // Недостаточно данных для анализа
                let message = 'Недостаточно данных для анализа';
                if (typeof apiResponse.result === 'string') {
                    message = apiResponse.result;
                } else if (apiResponse.error) {
                    message = apiResponse.error;
                } else if (apiResponse.message) {
                    message = apiResponse.message;
                }
                setErrorMessage(message);
            } else if (state === 'error') {
                // Другие ошибки
                let message = 'Не удалось загрузить статистику';
                if (typeof apiResponse.result === 'string') {
                    message = apiResponse.result;
                } else if (apiResponse.error) {
                    message = apiResponse.error;
                } else if (apiResponse.message) {
                    message = apiResponse.message;
                } else if (!response.ok) {
                    message = `Ошибка сервера: ${response.status}`;
                }
                setErrorMessage(message);
            }

        } catch (err) {
            console.error('Error fetching stats:', err);
            setWidgetState('error');
            setErrorMessage('Ошибка подключения к серверу');
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

    if (widgetState === 'loading') {
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
                    Анализируем вашу статистику...
                </Typography>
            </Card>
        );
    }

    if (widgetState === 'insufficient-data') {
        return (
            <FadeContainer>
                <InsufficientDataState
                    message={errorMessage}
                    onRetry={handleRefresh}
                    compact={compact}
                />
            </FadeContainer>
        );
    }

    if (widgetState === 'error') {
        return (
            <FadeContainer>
                <ErrorState
                    error={errorMessage}
                    onRetry={handleRefresh}
                    compact={compact}
                />
            </FadeContainer>
        );
    }

    if (widgetState === 'no-data' || !stats) {
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
                <EmojiObjectsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                    Данные отсутствуют
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Начните решать задания, чтобы получить статистику
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {loading ? 'Проверяем...' : 'Проверить наличие данных'}
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
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        if (percentage >= 40) return 'info';
        return 'error';
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
                            Функция находится на этапе тестирования. Могут быть сбои
                        </Button>
                    </Box>
                )}
            </Card>
        </FadeContainer>
    );
}