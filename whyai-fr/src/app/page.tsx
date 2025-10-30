'use client';
import {useEffect, useState} from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    IconButton,
    keyframes,
    styled,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import {ArrowForward, Close, TipsAndUpdates} from '@mui/icons-material';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useTheme} from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import TGBanner from "@/app/_components/telegram";
import {useAuthStore} from "./_stores/authStore";

interface Category {
    name: string;
    description: string;
    range: [number, number];
    color: string;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FadeContainer = styled(Box)(({ theme }) => ({
    animation: `${fadeIn} 0.5s ease-out both`,
}));

export default function HomePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();

    // Хуки вызываем всегда
    const [mounted, setMounted] = useState(false);
    const { token, isAuthenticated, initialize } = useAuthStore();
    const [openCategory, setOpenCategory] = useState<Category | null>(null);
    const [currentFact, setCurrentFact] = useState<string>('');
    const [loadingFact, setLoadingFact] = useState<boolean>(false);
    const [lockedTasks, setLockedTasks] = useState<number[]>([]);
    const [lockedPractice] = useState<string[]>(['ai-test']);
    const BaseApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        setMounted(true);
        initialize(); // Инициализируем состояние из cookies
    }, []);

    // Редирект если не авторизован
    useEffect(() => {
        if (mounted && !token) {
            router.push('/login');
        }
    }, [mounted, token, router]);

    useEffect(() => {
        const array = Array.from({ length: 18 }, (_, i) => i + 9);
        setLockedTasks(array);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchFactsAndSetFact = async () => {
            setLoadingFact(true);
            try {
                let savedFacts: string[] = JSON.parse(localStorage.getItem('factsList') || '[]');
                let savedUsed: number[] = JSON.parse(localStorage.getItem('usedFacts') || '[]');

                if (savedFacts.length === 0 || savedUsed.length >= savedFacts.length) {
                    const response = await fetch(`${BaseApiUrl}/fact`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    savedFacts = data.facts?.map((f: { fact: string }) => f.fact) || [];
                    savedUsed = [];
                    localStorage.setItem('factsList', JSON.stringify(savedFacts));
                    localStorage.setItem('usedFacts', JSON.stringify(savedUsed));
                }

                const availableIndices = savedFacts.map((_, i) => i).filter(i => !savedUsed.includes(i));
                const randomIndex = availableIndices.length > 0
                    ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
                    : 0;
                const updatedUsed = [...savedUsed, randomIndex];
                localStorage.setItem('usedFacts', JSON.stringify(updatedUsed));
                setCurrentFact(savedFacts[randomIndex] || "Нет доступных лайфхаков");

            } catch (error) {
                console.error('Error fetching facts:', error);
                setCurrentFact("Не удалось загрузить лайфхак. Попробуйте обновить страницу.");
            } finally {
                setLoadingFact(false);
            }
        };

        fetchFactsAndSetFact();
    }, [mounted, BaseApiUrl]);

    const categories: Category[] = [
        { name: '📒 Лексика', description: "Правильное употребление слов", range: [5, 8], color: theme.palette.primary.light },
        { name: '🖊️ Орфография', description: "Правописание букв в словах", range: [9, 15], color: theme.palette.primary.light },
        { name: '📃 Пунктуация', description: "Знаки препинания в предложениях", range: [16, 21], color: theme.palette.primary.light },
        { name: '📖 Текст', description: "Чтение и анализ содержимого текста", range: [22, 26], color: theme.palette.primary.light },
    ];
    return (
        <Container maxWidth="md" sx={{ py: 3, px: { xs: 1.5, sm: 1 } }}>
            <FadeContainer>
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 1000, textAlign: 'center', color: 'text.primary', fontSize: isMobile ? '1.7rem' : '2.5rem' }}>
                    Verbify
                </Typography>
                <Typography variant="h1" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: 'text.primary', fontSize: isMobile ? '1rem' : '1.25rem' }}>
                    Выбери раздел для изучения
                </Typography>
            </FadeContainer>

            <TGBanner />

            <FadeContainer>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, '& > *': { maxHeight: isMobile ? 130 : 140, width: '100%' } }}>
                    {categories.map(category => (
                        <Button key={category.name} onClick={() => setOpenCategory(category)} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 3, background: category.color, p: 1.5, aspectRatio: '3/2', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 } }}>
                            <Typography sx={{ fontWeight: 600, mb: 0.5, textAlign: 'center', color: 'text.primary', fontSize: isMobile ? '0.875rem' : '1.5rem' }}>
                                {category.name}
                            </Typography>
                            <Typography sx={{ fontWeight: 600, mb: 0.5, textAlign: 'center', color: 'text.primary', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                {category.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                Задания {category.range[0]}-{category.range[1]}
                            </Typography>
                            <ArrowForward sx={{ fontSize: isMobile ? 20 : 24, mt: 0.5 }} />
                        </Button>
                    ))}
                </Box>
            </FadeContainer>
            <FadeContainer>
                <Typography variant="h6" sx={{ mt: 6, mb: 3, fontWeight: 700, textAlign: 'center', color: 'text.primary', fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
                    ИИ-Практика
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'stretch' }}>
                    {[
                        { id: 'ai-test', title: '✅ Тест с AI-Анализом' },
                        { id: 'ai-essay', title: '🧠 AI-Проверка сочинения' }
                    ].map(practice => {
                        const isLocked = lockedPractice.includes(practice.id);
                        return (
                            <Tooltip key={practice.id} title={isLocked ? "Только с подпиской" : ""} placement="top">
                                <Box sx={{ position: 'relative', flex: 1, minWidth: 200 }}>
                                    {isLocked && <LockIcon sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: 'text.disabled' }} />}
                                    <Button
                                        variant="contained"
                                        disabled={isLocked}
                                        href={"/essay"}
                                        sx={{
                                            bgcolor: theme.palette.primary.light,
                                            borderRadius: 2,
                                            p: 2,
                                            fontSize: isMobile ? '0.9rem' : '1.1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            color: theme.palette.text.primary,
                                            width: '100%',
                                            height: 100,
                                            '&:hover': !isLocked ? { transform: 'translateY(-2px)' } : {},
                                            opacity: isLocked ? 0.7 : 1,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {practice.title}
                                    </Button>
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </FadeContainer>

            {/* Лайфхак */}


            {/* Диалог категории */}
            <Dialog open={!!openCategory} onClose={() => setOpenCategory(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 2, m: 1, maxHeight: '120vh', animation: `${fadeIn} 0.3s ease-out` } }}>
                {openCategory && (
                    <>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={600}>{openCategory.name}</Typography>
                            <IconButton onClick={() => setOpenCategory(null)} size="small"><Close fontSize="small" /></IconButton>
                        </Box>
                        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                            {Array.from({ length: openCategory.range[1] - openCategory.range[0] + 1 }, (_, i) => {
                                const taskNumber = openCategory.range[0] + i;
                                const isLocked = lockedTasks.includes(taskNumber);
                                return (
                                    <Tooltip key={taskNumber} title={isLocked ? "Тестируется" : ""} placement="top">
                                        <Box sx={{ position: 'relative' }}>
                                            {isLocked && <LockIcon sx={{ position: 'absolute', top: 8, right: 8, zIndex: 0, color: 'text.disabled' }} />}
                                            <Button
                                                component={isLocked ? 'button' : Link}
                                                href={isLocked ? undefined : `/theory?q=${taskNumber}`}
                                                variant="outlined"
                                                size="small"
                                                disabled={isLocked}
                                                sx={{ height: 80, borderRadius: 2, display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', '&:hover': { transform: isLocked ? 'none' : 'translateY(-2px)' }, opacity: isLocked ? 0.6 : 1, width: '100%' }}
                                            >
                                                <span style={{ fontSize: '1rem' }}>Задание</span>
                                                <span>№{taskNumber}</span>
                                            </Button>
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    </>
                )}
            </Dialog>
            <FadeContainer>
                <Alert
                    severity="info"
                    icon={<TipsAndUpdates fontSize="small" />}
                    sx={{
                        borderRadius: 2,
                        marginTop: 5,
                        bgcolor: 'surfaceContainerLow.main',
                        color: 'onSurfaceVariant.main',
                        border: 'none',
                        '& .MuiAlert-icon': {
                            color: 'primary.main',
                            alignItems: 'center'
                        }
                    }}
                >
                    <AlertTitle sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'onSurface.main'
                    }}>
                        Полезный лайфхак
                    </AlertTitle>
                    {loadingFact ? (
                        <Box display="flex" justifyContent="center">
                            <CircularProgress size={20} color="inherit" />
                        </Box>
                    ) : (
                        <Typography variant="body2" component="div" sx={{ color: 'onSurfaceVariant.main' }}>
                            {currentFact || "Для лучшего запоминания правил пробуйте объяснять их своими словами"}
                        </Typography>
                    )}
                </Alert>


            </FadeContainer>

        </Container>
    );
}
