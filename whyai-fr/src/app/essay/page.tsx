'use client';
import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    Fade,
    FormControl,
    FormControlLabel,
    Grow,
    InputLabel,
    keyframes,
    Link,
    MenuItem,
    Select,
    Slide,
    Snackbar,
    Stack,
    styled,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import {CloudUpload, Info, Star} from '@mui/icons-material';
import theme from "@/app/_config/theme";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/essay`;
const LOCAL_STORAGE_KEY = 'lastEssayResult';

interface EssayTheme {
    id: number;
    theme: string;
    text: string;
}

interface EssayEvaluation {
    score: number;
    feedback: string;
    recommendation: string;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const FadeContainer = styled(Box)(({theme}) => ({
    animation: `${fadeIn} 0.8s ease-out both`,
}));

const MarkdownContainer = styled(Box)(({theme}) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    boxShadow: theme.shadows[1],
    animation: `${slideUp} 0.6s ease-out`,
    '& pre': {
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(2),
        borderRadius: '12px',
        overflowX: 'auto',
        animation: `${fadeIn} 0.6s ease-in`
    }
}));

const LoadingPulse = styled(CircularProgress)({
    animation: `${pulse} 1.5s ease-in-out infinite`
});

const CenteredInstruction = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '120px',
    padding: theme.spacing(3),
    margin: theme.spacing(3, 0),
    backgroundColor: theme.palette.background.default,
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
    animation: `${fadeIn} 1s ease-out`
}));

const UploadSection = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    width: '100%',
    padding: theme.spacing(2),
    animation: `${slideUp} 0.6s ease-out`
}));

const FileDisplay = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
    maxWidth: '400px'
}));

const MarkdownComponents = {
    p: ({ children }: any) => {
        const text = typeof children === 'string' ? children : '';
        if (text.includes('**К') && (text.includes(':**') || text.includes(': **'))) {
            const criteria = text.split(/\n+/).filter(line => line.trim().startsWith('**К'));

            return (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    {criteria.map((criterion, index) => (
                        <Typography
                            key={index}
                            variant="body1"
                            paragraph
                            sx={{
                                mb: 2,
                                padding: '8px 0',
                                borderBottom: index < criteria.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {criterion.trim()}
                        </Typography>
                    ))}
                </Box>
            );
        }

        return <Typography variant="body1" paragraph sx={{ animation: `${fadeIn} 0.3s` }}>{children}</Typography>;
    },
    a: ({ children, href }: any) => <Link href={href} target="_blank" rel="noopener" color="primary" sx={{ animation: `${fadeIn} 0.3s` }}>{children}</Link>,
    ul: ({ children }: any) => <ul style={{ paddingLeft: '24px', margin: '12px 0', animation: `${fadeIn} 0.3s` }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ paddingLeft: '24px', margin: '12px 0', animation: `${fadeIn} 0.3s` }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: '8px', lineHeight: 1.6, animation: `${fadeIn} 0.3s` }}>{children}</li>,
    strong: ({ children }: any) => <strong style={{ color: theme.palette.primary.main }}>{children}</strong>
};

export default function EssayPage() {
    const router = useRouter();
    const resultRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [themes, setThemes] = useState<EssayTheme[]>([]);
    const [lastResult, setLastResult] = useState<EssayEvaluation | null>(null);
    const [useReadyTheme, setUseReadyTheme] = useState(false);
    const [manualInput, setManualInput] = useState(false);
    const [selectedThemeId, setSelectedThemeId] = useState<string>('');
    const [essayContent, setEssayContent] = useState('');
    const [customThemeText, setCustomThemeText] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [evaluation, setEvaluation] = useState<EssayEvaluation | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanningSource, setScanningSource] = useState(false);
    const [scanningEssay, setScanningEssay] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [essayImage, setEssayImage] = useState<File | null>(null);
    const [scannedSourceText, setScannedSourceText] = useState('');
    const [scannedEssayText, setScannedEssayText] = useState('');
    const [scanCompleted, setScanCompleted] = useState(false);

    const selectedTheme = themes.find(theme => theme.id.toString() === selectedThemeId);
    const canScanSource = sourceImage && !useReadyTheme && !manualInput;
    const canScanEssay = essayImage && !useReadyTheme && !manualInput;
    const canSubmit = useReadyTheme ?
        (selectedThemeId && essayContent.length >= 250) :
        (customThemeText && sourceText && essayContent.length >= 250);

    const getToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
        if (!token) router.push('/login');
        return token || '';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const themesRes = await fetch(`${API_BASE_URL}/themes`, {
                    headers: {'Authorization': `Bearer ${getToken()}`}
                });

                if (!themesRes.ok) throw new Error('Ошибка загрузки тем');
                const {result: themesData} = await themesRes.json();
                setThemes(themesData);

                const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedData) {
                    setLastResult(JSON.parse(savedData));
                }
            } catch (err) {
                handleError(err as Error);
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = (setImage: React.Dispatch<React.SetStateAction<File | null>>, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const handleScanSource = async () => {
        if (!sourceImage) return;

        setScanningSource(true);
        try {
            const formData = new FormData();
            formData.append('files', sourceImage);

            const response = await fetch(`${API_BASE_URL}/scan`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: formData
            });

            if (!response.ok) throw new Error('Ошибка сканирования исходного текста');

            const {result} = await response.json();

            if (typeof result === 'string') {
                setScannedSourceText(result);
                setSourceText(result);
            } else {
                throw new Error('Некорректный формат ответа от сервера');
            }

        } catch (err) {
            handleError(err as Error);
        } finally {
            setScanningSource(false);
        }
    };

    const handleScanEssay = async () => {
        if (!essayImage) return;

        setScanningEssay(true);
        try {
            const formData = new FormData();
            formData.append('files', essayImage);

            const response = await fetch(`${API_BASE_URL}/scan`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: formData
            });

            if (!response.ok) throw new Error('Ошибка сканирования сочинения');

            const {result} = await response.json();

            if (typeof result === 'string') {
                setScannedEssayText(result);
                setEssayContent(result);
                setScanCompleted(true);
            } else {
                throw new Error('Некорректный формат ответа от сервера');
            }

        } catch (err) {
            handleError(err as Error);
        } finally {
            setScanningEssay(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = useReadyTheme ? {
                theme: selectedTheme?.theme,
                text: selectedTheme?.text || '',
                essay: essayContent
            } : {
                theme: customThemeText,
                text: sourceText,
                essay: essayContent
            };

            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Ошибка оценки сочинения');

            const {result} = await response.json();
            setEvaluation(result);

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
            setLastResult(result);

            resultRef.current?.scrollIntoView({behavior: 'smooth'});
        } catch (err) {
            handleError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error: Error) => {
        console.error(error);
        setError(error.message);
        setSnackbarOpen(true);
    };

    const resetForm = () => {
        setSourceImage(null);
        setEssayImage(null);
        setScannedSourceText('');
        setScannedEssayText('');
        setSourceText('');
        setEssayContent('');
        setCustomThemeText('');
        setScanCompleted(false);
    };

    return (
        <Container maxWidth="md" sx={{py: 2}}>
            <FadeContainer>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" sx={{
                        fontWeight: 700,
                        animation: `${fadeIn} 1s ease-out`
                    }}>
                        ИИ-Проверка сочинений
                    </Typography>
                </Box>
            </FadeContainer>

            {/* Центрированная инструкция */}
            <CenteredInstruction>
                <Info color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Как это работает?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Выберите режим → Загрузите материалы → Получите оценку
                </Typography>
            </CenteredInstruction>

            <Grow in={!!lastResult} timeout={500}>
                <Card sx={{
                    mb: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    transformOrigin: 'top center'
                }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Star color="primary"/>
                            <Typography variant="h6">
                                Последняя оценка: {lastResult?.score}/22
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grow>

            <Box component="form" onSubmit={handleSubmit} sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                '& > *': {
                    animation: `${slideUp} 0.6s ease-out`
                }
            }}>
                <Fade in timeout={600}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={useReadyTheme}
                                onChange={(e) => {
                                    setUseReadyTheme(e.target.checked);
                                    resetForm();
                                }}
                                color="primary"
                            />
                        }
                        label="Писать по готовой теме и тексту"
                        sx={{alignSelf: 'flex-start'}}
                    />
                </Fade>

                {!useReadyTheme && (
                    <Fade in timeout={650}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={manualInput}
                                    onChange={(e) => {
                                        setManualInput(e.target.checked);
                                        resetForm();
                                    }}
                                    color="primary"
                                />
                            }
                            label="Ручной ввод текста"
                            sx={{alignSelf: 'flex-start'}}
                        />
                    </Fade>
                )}

                {useReadyTheme ? (
                    <Grow in timeout={700}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Выберите тему сочинения</InputLabel>
                            <Select
                                value={selectedThemeId}
                                label="Выберите тему сочинения"
                                onChange={(e) => setSelectedThemeId(e.target.value)}
                                required
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 400,
                                            '& .MuiMenuItem-root': {
                                                whiteSpace: 'normal',
                                                lineHeight: 1.5,
                                                py: 2,
                                                transition: 'all 0.2s'
                                            }
                                        }
                                    }
                                }}
                            >
                                {themes.map((theme) => (
                                    <MenuItem
                                        key={theme.id}
                                        value={theme.id.toString()}
                                        sx={{
                                            '&:hover': {
                                                transform: 'translateX(5px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{width: '100%'}}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {theme.theme}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{whiteSpace: 'pre-wrap'}}
                                            >
                                                {theme.text.slice(0, 50)}...
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grow>
                ) : (
                    <Grow in timeout={700}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <TextField
                                label="Тема сочинения"
                                value={customThemeText}
                                onChange={(e) => setCustomThemeText(e.target.value)}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Введите тему или загрузите фото с исходным текстом"
                            />

                            {manualInput ? (
                                <TextField
                                    label="Исходный текст"
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    placeholder="Введите исходный текст для сочинения"
                                />
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography variant="subtitle1" textAlign="center">
                                        Для удобства вы можете отсканировать ваши материалы
                                    </Typography>

                                    {/* Блок для исходного текста */}
                                    <UploadSection>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Исходный текст:
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={<CloudUpload/>}
                                            sx={{ width: '100%', maxWidth: '400px' }}
                                        >
                                            Загрузить исходный текст
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(setSourceImage, e)}
                                            />
                                        </Button>

                                        {sourceImage && (
                                            <FileDisplay>
                                                <Chip
                                                    label={sourceImage.name}
                                                    onDelete={() => setSourceImage(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ maxWidth: '100%' }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="medium"
                                                    onClick={handleScanSource}
                                                    disabled={scanningSource}
                                                    sx={{ width: '100%', maxWidth: '200px' }}
                                                >
                                                    {scanningSource ? <LoadingPulse size={20}/> : 'Сканировать'}
                                                </Button>
                                            </FileDisplay>
                                        )}
                                    </UploadSection>

                                    {/* Блок для сочинения */}
                                    <UploadSection>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Сочинение:
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={<CloudUpload/>}
                                            sx={{ width: '100%', maxWidth: '400px' }}
                                        >
                                            Загрузить сочинение
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(setEssayImage, e)}
                                            />
                                        </Button>

                                        {essayImage && (
                                            <FileDisplay>
                                                <Chip
                                                    label={essayImage.name}
                                                    onDelete={() => setEssayImage(null)}
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{ maxWidth: '100%' }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="medium"
                                                    onClick={handleScanEssay}
                                                    disabled={scanningEssay}
                                                    sx={{ width: '100%', maxWidth: '200px' }}
                                                >
                                                    {scanningEssay ? <LoadingPulse size={20}/> : 'Сканировать'}
                                                </Button>
                                            </FileDisplay>
                                        )}
                                    </UploadSection>
                                </Box>
                            )}
                        </Box>
                    </Grow>
                )}

                {selectedTheme && useReadyTheme && (
                    <Grow in timeout={800}>
                        <Box sx={{
                            p: 3,
                            bgcolor: 'background.default',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s'
                        }}>
                            <Typography variant="h6" gutterBottom>
                                Полный текст выбранной темы:
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{whiteSpace: 'pre-wrap', lineHeight: 1.8}}
                            >
                                {selectedTheme.text}
                            </Typography>
                        </Box>
                    </Grow>
                )}

                {!useReadyTheme && scannedSourceText && (
                    <Grow in timeout={800}>
                        <TextField
                            label="Распознанный исходный текст"
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                            required
                            variant="outlined"
                            helperText="Проверьте и при необходимости отредактируйте распознанный текст"
                        />
                    </Grow>
                )}

                {(manualInput || useReadyTheme || scanCompleted) && (
                    <Grow in timeout={900}>
                        <TextField
                            label="Текст вашего сочинения"
                            value={essayContent}
                            onChange={(e) => setEssayContent(e.target.value)}
                            multiline
                            minRows={10}
                            fullWidth
                            required
                            variant="outlined"
                            helperText="Минимальный объем - 250 слов"
                            sx={{
                                '& textarea': {
                                    lineHeight: 1.6,
                                    transition: 'all 0.3s'
                                }
                            }}
                        />
                    </Grow>
                )}

                {(manualInput || useReadyTheme || scanCompleted) && (
                    <Grow in timeout={1000}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || !canSubmit}
                            sx={{
                                width: '100%',
                                py: 2,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            {loading ? (
                                <LoadingPulse size={24} color="inherit"/>
                            ) : 'Отправить на проверку'}
                        </Button>
                    </Grow>
                )}
            </Box>

            {evaluation && (
                <MarkdownContainer ref={resultRef}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <Chip
                            label={`Оценка: ${evaluation.score}/22`}
                            color="primary"
                            sx={{
                                fontWeight: 700,
                                animation: `${pulse} 1s ease`
                            }}
                        />
                    </Box>

                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                        {evaluation.feedback}
                    </ReactMarkdown>

                    <Box sx={{
                        mt: 4,
                        pt: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        animation: `${fadeIn} 0.5s ease-out`
                    }}>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
                            Рекомендации:
                        </Typography>
                        <ReactMarkdown components={MarkdownComponents}>
                            {evaluation.recommendation}
                        </ReactMarkdown>
                        <Typography variant="caption" gutterBottom sx={{fontWeight: 400}}>
                            Напоминание: Результаты выданные нейросетью не являются окончательными и могут быть
                            ошибочными
                        </Typography>
                    </Box>
                </MarkdownContainer>
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                TransitionComponent={Slide}
            >
                <Alert
                    severity="error"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        animation: `${slideUp} 0.3s ease-out`
                    }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}