// app/practice/session/page.tsx
'use client';

import {useEffect, useState} from 'react';
import {
    Alert,
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
    Fade,
    IconButton,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import {
    AccessTime,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    Close as CloseIcon,
    Lightbulb,
    Notes,
    Send
} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/practice`;

interface PracticeTask {
    id: number;
    text: string;
    hint: string;
}

interface PracticeSettings {
    mode: 'practice' | 'exam';
    taskType: string;
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    showHints: boolean;
}

interface TaskAnswer {
    task_id: number;
    value: string;
    comment: string;
}

interface PracticeRequest {
    user_id: number;
    ege_number: number;
    count: number;
    answers: TaskAnswer[];
}

interface CheckedPractice {
    task_id: number;
    user_answer: string;
    right_answer: string;
    is_correct: boolean;
    comment: string;
    hint: string;
}

interface PracticeResult {
    attempt_id: number;
    results: CheckedPractice[];
    stats: {
        total: number;
        correct: number;
        incorrect: number;
        percent: number;
    };
}

const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    return token || '';
};

export default function PracticeSessionPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false);
    const [practiceId, setPracticeId] = useState<string>('');
    const [tasks, setTasks] = useState<PracticeTask[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [comments, setComments] = useState<Record<number, string>>({});
    const [settings, setSettings] = useState<PracticeSettings | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [showHint, setShowHint] = useState<Record<number, boolean>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const savedSettings = localStorage.getItem('practiceSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
            fetchTasks(parsed);
        } else {
            router.push('/practice/settings');
        }
    }, [mounted]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev && prev > 0) return prev - 1;
                return 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchTasks = async (settings: PracticeSettings) => {
        try {
            const taskTypeNum = parseInt(settings.taskType.replace('ege_', ''));
            const response = await fetch(
                `${API_BASE_URL}/tasks?type=${taskTypeNum}&count=${settings.count}`,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
            );

            if (response.status === 429) {
                setRateLimitDialogOpen(true);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();

            const tasksArray = data.tasks || data;
            setTasks(tasksArray);

            if (settings.mode === 'exam') {
                setTimeLeft(settings.count * 180);
            }
        } catch (err) {
            setError('Не удалось загрузить задания');
            setSnackbarOpen(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (taskId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [taskId]: value }));
    };

    const handleCommentChange = (taskId: number, value: string) => {
        setComments(prev => ({ ...prev, [taskId]: value }));
    };

    const toggleHint = (taskId: number) => {
        setShowHint(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleSubmit = async () => {
        if (!settings || !tasks.length) return;

        setSubmitting(true);
        setError(null);

        const taskTypeNum = parseInt(settings.taskType.replace('ege_', ''));

        const answersList: TaskAnswer[] = tasks.map(task => ({
            task_id: task.id,
            value: answers[task.id] || '',
            comment: comments[task.id] || ''
        }));

        const payload: PracticeRequest = {
            user_id: 1,
            ege_number: taskTypeNum,
            count: tasks.length,
            answers: answersList
        };

        try {
            const response = await fetch(`${API_BASE_URL}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                setRateLimitDialogOpen(true);
                setSubmitting(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to check practice');
            }

            const responseData = await response.json();
            console.log('Response from server:', responseData);

            // Разворачиваем result из ответа сервера
            const resultData = responseData.result;

            localStorage.setItem('lastPractice', JSON.stringify({
                practiceId: practiceId,
                tasks,
                answers,
                comments,
                results: resultData, // теперь сохраняем развернутый объект
                completedAt: new Date().toISOString(),
                settings
            }));

            router.push('/practice/results');
        } catch (err) {
            setError('Не удалось отправить ответы');
            setSnackbarOpen(true);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const isAllAnswered = () => {
        return tasks.every(task => answers[task.id]?.trim());
    };

    const formatTaskText = (text: string) => {
        return text.replace(/\\n/g, '\n');
    };

    if (loading || !mounted || !settings) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
                    <CircularProgress sx={{ color: theme.palette.primary.main, mb: 2 }} />
                    <Typography color="text.secondary">Загружаем задания...</Typography>
                </Box>
            </Container>
        );
    }

    if (!tasks.length) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Нет доступных заданий. Попробуйте выбрать другой тип или количество.
                </Alert>
                <Button onClick={() => router.push('/practice/settings')} sx={{ mt: 2 }}>
                    Вернуться к настройкам
                </Button>
            </Container>
        );
    }

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

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                        {settings.taskType === 'ege_9' ? 'Задание 9: Правописание корней' : 'Практика'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {settings.mode === 'practice' ? 'Тренировочный режим' : 'Экзаменационный режим'}
                    </Typography>
                </Box>
                {timeLeft !== null && (
                    <Chip
                        icon={<AccessTime />}
                        label={formatTime(timeLeft)}
                        color={timeLeft < 60 ? 'error' : 'default'}
                        sx={{ fontWeight: 600 }}
                    />
                )}
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tasks.map((task, idx) => (
                        <Tab
                            key={task.id}
                            label={`Задание ${idx + 1}`}
                            icon={answers[task.id] ? <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} /> : undefined}
                            iconPosition="end"
                            sx={{
                                '&.Mui-selected': {
                                    color: theme.palette.primary.dark,
                                    fontWeight: 600
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            <Fade in={true} key={activeTab}>
                <Box>
                    {tasks.map((task, idx) => (
                        <Box key={task.id} sx={{ display: activeTab === idx ? 'block' : 'none' }}>
                            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 3,
                                        whiteSpace: 'pre-line',
                                        lineHeight: 1.8,
                                        fontSize: '1rem',
                                        backgroundColor: '#f5f5f5',
                                        p: 2,
                                        borderRadius: 2
                                    }}
                                >
                                    {formatTaskText(task.text)}
                                </Typography>

                                {/* Кнопка подсказки (только если включены в настройках) */}
                                {settings.showHints && task.hint && (
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            startIcon={<Lightbulb />}
                                            onClick={() => toggleHint(task.id)}
                                            sx={{ color: theme.palette.primary.dark }}
                                        >
                                            {showHint[task.id] ? 'Скрыть подсказку' : 'Показать подсказку'}
                                        </Button>
                                    </Box>
                                )}

                                {/* Текст подсказки */}
                                {settings.showHints && showHint[task.id] && task.hint && (
                                    <Alert
                                        severity="info"
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            bgcolor: theme.palette.primary.light,
                                            color: theme.palette.text.primary
                                        }}
                                        icon={<Lightbulb />}
                                    >
                                        {task.hint}
                                    </Alert>
                                )}

                                <TextField
                                    fullWidth
                                    placeholder="Введите номера ответов (например: 124)"
                                    value={answers[task.id] || ''}
                                    onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                                    variant="outlined"
                                    disabled={submitting}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                />

                                {/* Комментарии всегда доступны в тренировочном режиме */}
                                {settings.mode === 'practice' && (
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: 'text.secondary'
                                            }}
                                        >
                                            <Notes fontSize="small" />
                                            Комментарий (как рассуждали?)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Напишите, почему выбрали такой ответ. Это поможет AI точнее проанализировать ошибки"
                                            value={comments[task.id] || ''}
                                            onChange={(e) => handleCommentChange(task.id, e.target.value)}
                                            variant="outlined"
                                            disabled={submitting}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Paper>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                <Button
                                    startIcon={<ArrowBack />}
                                    onClick={() => setActiveTab(prev => prev - 1)}
                                    disabled={activeTab === 0 || submitting}
                                >
                                    Назад
                                </Button>
                                <Chip label={`${activeTab + 1} из ${tasks.length}`} />
                                <Button
                                    endIcon={<ArrowForward />}
                                    onClick={() => setActiveTab(prev => prev + 1)}
                                    disabled={activeTab === tasks.length - 1 || submitting}
                                >
                                    Далее
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Fade>

            <Paper sx={{
                p: 2,
                borderRadius: 3,
                position: 'sticky',
                bottom: 16,
                bgcolor: 'background.paper',
                boxShadow: 3
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Выполнено: {Object.keys(answers).length} из {tasks.length}
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                        onClick={handleSubmit}
                        disabled={!isAllAnswered() || timeLeft === 0 || submitting}
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            color: 'text.primary',
                            '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                    >
                        {submitting ? 'Отправка...' : 'Завершить и проверить'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}