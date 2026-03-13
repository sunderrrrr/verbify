// app/practice/results/page.tsx - исправленная версия с отладкой

'use client';

import {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    LinearProgress,
    Paper,
    Snackbar,
    Typography,
    useMediaQuery
} from '@mui/material';
import {Cancel, CheckCircle, Close as CloseIcon, ExpandMore, Home, Psychology, Refresh,} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/practice`;

interface PracticeData {
    practiceId: string;
    tasks: any[];
    answers: Record<number, string>;
    comments: Record<number, string>;
    results: PracticeResult;
    completedAt: string;
    settings: any;
}

interface PracticeResult {
    attempt_id: number;
    results: {
        task_id: number;
        user_answer: string;
        right_answer: string;
        is_correct: boolean;
        comment?: string;
        hint: string;
    }[];
    stats: {
        total: number;
        correct: number;
        incorrect: number;
        percent: number;
    };
}

interface AiAnalysis {
    overview: string;
    topicBreakdown: {
        topic: string;
        errors: number;
        severity: 'low' | 'medium' | 'high';
    }[];
    recommendations: string[];
    commentAnalysis: string;
}

const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    return token || '';
};

export default function PracticeResultsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();

    const [practice, setPractice] = useState<PracticeData | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const lastPractice = localStorage.getItem('lastPractice');
        console.log('Raw localStorage data:', lastPractice);

        if (lastPractice) {
            try {
                const parsed = JSON.parse(lastPractice);
                console.log('Parsed practice data:', parsed);

                // Проверяем и нормализуем структуру данных
                if (parsed.results && parsed.results.result) {
                    // Если есть лишняя вложенность result.result
                    console.log('Fixing nested result structure');
                    parsed.results = parsed.results.result;
                }

                // Проверяем структуру
                if (parsed && parsed.results) {
                    console.log('Results structure:', parsed.results);
                    console.log('Results stats:', parsed.results.stats);
                    console.log('Results array:', parsed.results.results);
                }

                setPractice(parsed);
            } catch (err) {
                console.error('Failed to parse practice data:', err);
                setError('Не удалось загрузить результаты');
                setSnackbarOpen(true);
            }
        } else {
            console.log('No practice data in localStorage');
            router.push('/practice/settings');
        }
    }, [mounted]);

    const requestAiAnalysis = async () => {
        if (!practice) return;

        setAnalysisLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    user_id: 1,
                    practice_id: practice.practiceId,
                    tasks: practice.tasks,
                    answers: practice.answers,
                    comments: practice.comments,
                    results: practice.results.results
                })
            });

            if (response.status === 429) {
                setRateLimitDialogOpen(true);
                setAnalysisLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            console.log('AI Analysis response:', data);
            setAiAnalysis(data.analysis || data);
        } catch (err) {
            setError('Не удалось получить анализ от нейросети');
            setSnackbarOpen(true);
            console.error(err);
        } finally {
            setAnalysisLoading(false);
        }
    };

    if (!mounted) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
                </Box>
            </Container>
        );
    }

    if (!practice) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
                </Box>
            </Container>
        );
    }

    // Безопасное получение stats с проверкой
    const stats = practice.results?.stats || { total: 0, correct: 0, incorrect: 0, percent: 0 };
    const resultsArray = practice.results?.results || [];

    console.log('Rendering with stats:', stats);
    console.log('Rendering with results array:', resultsArray);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
                    {error}
                </Alert>
            </Snackbar>

            <Dialog open={rateLimitDialogOpen} onClose={() => setRateLimitDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>Ой, похоже вы исчерпали дневной лимит проверок🥺</span>
                        <IconButton onClick={() => setRateLimitDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" alignItems="center">
                        <DialogContentText>
                            Мы ограничиваем количество проверок для экономии ресурсов, но вы можете оформить подписку и поддержать проект!
                        </DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        href="https://verbify.icu/profile"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setRateLimitDialogOpen(false)}
                        sx={{ px: 4 }}
                    >
                        Подробнее👀
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.dark, mb: 1 }}>
                    Результаты
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {practice.settings?.mode === 'practice' ? 'Тренировка' : 'Экзамен'} · {new Date(practice.completedAt).toLocaleString()}
                </Typography>
            </Box>

            {/* Отладочная информация - убери после исправления */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0f0f0' }}>
                <Typography variant="body2">Stats: {JSON.stringify(stats)}</Typography>
                <Typography variant="body2">Results count: {resultsArray.length}</Typography>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                        {stats.correct}
                    </Typography>
                    <Typography color="text.secondary">Верно</Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                        {stats.incorrect}
                    </Typography>
                    <Typography color="text.secondary">Ошибки</Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: theme.palette.primary.dark, fontWeight: 700 }}>
                        {stats.percent}%
                    </Typography>
                    <Typography color="text.secondary">Точность</Typography>
                </Paper>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Общий прогресс
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={stats.percent}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: stats.percent > 80
                                ? theme.palette.success.main
                                : stats.percent > 50
                                    ? theme.palette.warning.main
                                    : theme.palette.error.main
                        }
                    }}
                />
            </Paper>

            {!aiAnalysis && !analysisLoading && (
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={requestAiAnalysis}
                    sx={{
                        mb: 4,
                        py: 2,
                        bgcolor: theme.palette.primary.main,
                        color: 'text.primary',
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                    startIcon={<Psychology />}
                >
                    Получить разбор от AI
                </Button>
            )}

            {analysisLoading && (
                <Paper sx={{ p: 4, borderRadius: 3, mb: 4, textAlign: 'center' }}>
                    <CircularProgress sx={{ color: theme.palette.primary.main, mb: 2 }} />
                    <Typography color="text.secondary">AI анализирует ваши ответы...</Typography>
                </Paper>
            )}

            {aiAnalysis && (
                <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Psychology sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Анализ нейросети
                        </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {aiAnalysis.overview}
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        <AlertTitle>Анализ ваших комментариев</AlertTitle>
                        <Typography variant="body2">
                            {aiAnalysis.commentAnalysis}
                        </Typography>
                    </Alert>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            📊 Статистика ошибок по темам:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {aiAnalysis.topicBreakdown?.map((topic, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${topic.topic}: ${topic.errors} ошибок`}
                                    color={topic.severity === 'high' ? 'error' : topic.severity === 'medium' ? 'warning' : 'success'}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            💡 Рекомендации:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20, color: theme.palette.text.secondary }}>
                            {aiAnalysis.recommendations?.map((rec, idx) => (
                                <li key={idx}>
                                    <Typography variant="body2">{rec}</Typography>
                                </li>
                            ))}
                        </ul>
                    </Box>
                </Paper>
            )}

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Разбор заданий
            </Typography>

            {resultsArray.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Нет данных о выполненных заданиях
                </Alert>
            ) : (
                practice.tasks?.map((task, idx) => {
                    const result = resultsArray.find(r => r.task_id === task.id);
                    if (!result) return null;

                    return (
                        <Accordion
                            key={task.id}
                            sx={{
                                mb: 2,
                                borderRadius: '12px !important',
                                '&:before': { display: 'none' }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    {result.is_correct ? (
                                        <CheckCircle sx={{ color: theme.palette.success.main }} />
                                    ) : (
                                        <Cancel sx={{ color: theme.palette.error.main }} />
                                    )}
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Задание {idx + 1}
                                    </Typography>
                                    <Chip
                                        label={result.is_correct ? 'Верно' : 'Ошибка'}
                                        size="small"
                                        color={result.is_correct ? 'success' : 'error'}
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                        mb: 2,
                                        color: 'text.secondary'
                                    }}
                                >
                                    {task.text}
                                </Typography>

                                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Ваш ответ: <strong>{result.user_answer || '(пусто)'}</strong>
                                    </Typography>
                                    {!result.is_correct && (
                                        <Typography variant="subtitle2" sx={{ color: theme.palette.success.main }}>
                                            Правильный ответ: <strong>{result.right_answer}</strong>
                                        </Typography>
                                    )}
                                    {result.comment && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Ваш комментарий:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                "{result.comment}"
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {!result.is_correct && result.hint && (
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        <Typography variant="body2">
                                            💡 {result.hint}
                                        </Typography>
                                    </Alert>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={() => router.push('/')}
                >
                    На главную
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() => router.push('/practice/settings')}
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        color: 'text.primary',
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                >
                    Новая практика
                </Button>
            </Box>
        </Container>
    );
}