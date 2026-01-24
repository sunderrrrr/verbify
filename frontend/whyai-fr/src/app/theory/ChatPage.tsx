'use client';
import {useEffect, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Alert,
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    keyframes,
    Link,
    Snackbar,
    styled,
    TextField,
    Typography
} from '@mui/material';
import {ArrowBack, Close as CloseIcon, Delete, Send} from '@mui/icons-material';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Message {
    id: string;
    content: string;
    isBot: boolean;
    createdAt?: string;
}

interface ChatResponseItem {
    id: number;
    user_id: number;
    task_id: number;
    role: string;
    content: string | object;
    created_at: string;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

const MessageContainer = styled(Box)(({ theme }) => ({
    maxWidth: '85%',
    borderRadius: 8* 2,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[1],
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    animation: `${fadeIn} 0.3s ease-out`,
    '& pre': {
        backgroundColor: theme.palette.grey[100],
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    }
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    animation: `${typingAnimation} 1.5s infinite`
}));

const MarkdownComponents = {
    p: ({ children }: any) => (
        <Typography
            paragraph
            sx={{
                margin: 0,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
            }}
        >
            {children}
        </Typography>
    ),
    a: ({ children, href }: any) => (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ wordBreak: 'break-all', color: 'primary.main' }}
        >
            {children}
        </Link>
    ),
    ul: ({ children }: any) => (
        <ul style={{ paddingLeft: '20px', margin: '8px 0', overflowWrap: 'anywhere' }}>{children}</ul>
    ),
    ol: ({ children }: any) => (
        <ol style={{ paddingLeft: '20px', margin: '8px 0', overflowWrap: 'anywhere' }}>{children}</ol>
    ),
    li: ({ children }: any) => <li style={{ marginBottom: '4px' }}>{children}</li>,
    code: ({ children }: any) => (
        <code
            style={{
                backgroundColor: '#f5f5f5',
                padding: '2px 4px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
            }}
        >
            {children}
        </code>
    )
};

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const taskNumber = searchParams.get('q');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [theoryContent, setTheoryContent] = useState('');
    const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false);

    const getToken = () => {
        if (typeof window === 'undefined') return '';
        const tokenCookie = document.cookie.split('; ').find(c => c.startsWith('authToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : '';
    };

    useEffect(() => {
        const token = getToken();
        if (!token) router.push('/login');
    }, [router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    const getAuthHeaders = () => {
        const token = getToken();
        if (!token) {
            router.push('/login');
            return null;
        }
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const loadChatHistory = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers || !taskNumber) return [];

            const response = await fetch(`${API_BASE_URL}/theory/${taskNumber}/chat`, {
                headers,
                credentials: 'include'
            });

            if (response.status === 401) {
                document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                router.push('/login');
                return [];
            }

            const data = await response.json();

            return (data.result || [])
                .filter((item: ChatResponseItem) => item?.content && item.role !== 'system')
                .map((item: ChatResponseItem) => ({
                    id: `msg-${item.id}`,
                    content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
                    isBot: item.role === 'assistant',
                    createdAt: item.created_at
                }));
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            return [];
        }
    };

    useEffect(() => {
        if (!taskNumber) return;
        const loadData = async () => {
            try {
                setLoadingData(true);
                const headers = getAuthHeaders();
                if (!headers) return;

                const [theoryResponse, chatHistory] = await Promise.all([
                    fetch(`${API_BASE_URL}/theory/${taskNumber}`, { headers, credentials: 'include' }),
                    loadChatHistory()
                ]);

                if (!theoryResponse.ok) throw new Error('Ошибка загрузки теории');
                const theoryData = await theoryResponse.json();

                setTheoryContent(theoryData.theory || '');

                const initialMessages: Message[] = [
                    {
                        id: 'welcome-msg',
                        content: `Привет! Я ИИ для подготовки к **ЕГЭ по русскому языку**\n\n и помогу тебе с заданием №${taskNumber}!\n\n❓ **Что я умею:** \n\n⭐ Объяснять непонятные темы по заданию \n\n⭐ Приводить тебе примеры для лучшего запоминания \n\n⭐ Подстраиваться под тебя и твой уровень знаний \n\n⭐ Забыть все, если ты нажмёшь на кнопку "Стереть" \n\n[Скачать PDF Теории](/theory?q=${taskNumber})`,
                        isBot: true
                    }
                ];

                if (theoryData.theory) {
                    initialMessages.push({
                        id: 'theory-msg',
                        content: theoryData.theory,
                        isBot: true
                    });
                }

                if (chatHistory?.length) initialMessages.push(...chatHistory);
                setMessages(initialMessages);
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError((err as Error).message);
                setSnackbarOpen(true);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, [taskNumber]);

    const handleDeleteHistory = async () => {
        if (!taskNumber) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await fetch(`${API_BASE_URL}/theory/${taskNumber}/chat`, {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });
            if (response.ok) {
                setMessages(prev => prev.filter(m => m.id === 'welcome-msg' || m.id === 'theory-msg'));
            }
        } catch (error) {
            console.error('Ошибка удаления истории:', error);
        }
    };

    const sanitizeInput = (text: string) => {
        return text.replace(/[<>]/g, '').trim(); // простая защита от HTML-инъекций
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !taskNumber || loading) return;

        const cleanInput = sanitizeInput(input);
        const headers = getAuthHeaders();
        if (!headers) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: cleanInput,
            isBot: false
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setIsBotTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/theory/${taskNumber}/chat`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    role: 'user',
                    content: userMessage.content,
                    theory: theoryContent
                })
            });

            if (response.status === 429) {
                setRateLimitDialogOpen(true);
                return;
            }

            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

            const data = await response.json();

            if (data?.result && data.result.length > 0) {
                const lastReply = data.result[data.result.length - 1];
                if (lastReply.role === 'assistant') {
                    const safeContent =
                        typeof lastReply.content === 'string'
                            ? lastReply.content
                            : JSON.stringify(lastReply.content, null, 2);

                    setMessages(prev => [
                        ...prev,
                        {
                            id: `bot-${lastReply.id}`,
                            content: safeContent,
                            isBot: true,
                            createdAt: lastReply.created_at
                        }
                    ]);
                }
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setError((err as Error).message);
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setIsBotTyping(false);
        }
    };

    if (loadingData)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper' }}>
                <Container maxWidth="md">
                    <Box display="flex" alignItems="center" py={2}>
                        <IconButton onClick={() => router.back()} edge="start">
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" component="h1" ml={2}>
                            {taskNumber ? `#️⃣ Задание ${taskNumber}` : 'Чат с помощником'}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDeleteHistory}
                            sx={{ ml: 'auto' }}
                            disabled={loading}
                        >
                            Стереть
                        </Button>
                    </Box>
                </Container>
            </AppBar>

            <Container
                maxWidth="md"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    py: 3,
                    overflowY: 'auto'
                }}
            >
                {messages.map((msg) => (
                    <MessageContainer
                        key={msg.id}
                        sx={{
                            alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                            bgcolor: msg.isBot ? 'background.paper' : 'primary.light',
                            color: msg.isBot ? 'text.primary' : 'primary.contrastText'
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {typeof msg.content === 'string'
                                ? msg.content
                                : JSON.stringify(msg.content, null, 2)}
                        </ReactMarkdown>
                        {msg.createdAt && (
                            <Typography variant="caption" display="block" textAlign="right" mt={1}>
                                {new Date(msg.createdAt).toLocaleString()}
                            </Typography>
                        )}
                    </MessageContainer>
                ))}

                {isBotTyping && (
                    <MessageContainer sx={{ alignSelf: 'flex-start', bgcolor: 'background.paper' }}>
                        <TypingIndicator>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.primary' }} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {process.env.NEXT_PUBLIC_APP_NAME || 'Бот'} печатает...
                            </Typography>
                        </TypingIndicator>
                    </MessageContainer>
                )}
                <div ref={messagesEndRef} />
            </Container>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Container maxWidth="md" sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Введите ваш вопрос..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        inputProps={{ maxLength: 500 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !input.trim()}
                        sx={{
                            minWidth: 56,
                            height: 56,
                            borderRadius: '50%'
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
                    </Button>
                </Container>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Dialog open={rateLimitDialogOpen} onClose={() => setRateLimitDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>Ой, похоже вы исчерпали дневной лимит вопросов🥺</span>
                        <IconButton onClick={() => setRateLimitDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" alignItems="center">
                        <Box sx={{ mr: 3 }}>
                            <Image src="/whyai-logo.png" alt="" width={80} height={80} style={{ borderRadius: '50%' }} />
                        </Box>
                        <DialogContentText>
                            Мы ограничиваем запросы для экономии ресурсов, но вы можете оформить подписку и поддержать проект!
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
        </Box>
    );
}
