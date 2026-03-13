// app/practice/settings/page.tsx
'use client';

import {useState} from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    Slider,
    Switch,
    Typography,
    useMediaQuery
} from '@mui/material';
import {ArrowForward, Lightbulb, Psychology, School} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {useRouter} from 'next/navigation';

interface PracticeSettings {
    mode: 'practice' | 'exam';
    taskType: string;
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    showHints: boolean; // показывать подсказки или нет
}

export default function PracticeSettingsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();

    const [settings, setSettings] = useState<PracticeSettings>({
        mode: 'practice',
        taskType: 'ege_9',
        count: 5,
        difficulty: 'medium',
        showHints: true // по умолчанию включены
    });

    const taskTypes = [
        { id: 'ege_9', name: 'Задание 9: Корни', description: 'Правописание корней, чередование', egeNumber: 9 },
        { id: 'ege_10', name: 'Задание 10: Приставки', description: 'Правописание приставок', egeNumber: 10 },
        { id: 'ege_11', name: 'Задание 11: Суффиксы', description: 'Суффиксы существительных и прилагательных', egeNumber: 11 },
        { id: 'ege_12', name: 'Задание 12: Окончания', description: 'Личные окончания глаголов', egeNumber: 12 },
    ];

    const handleStart = () => {
        localStorage.setItem('practiceSettings', JSON.stringify(settings));
        router.push('/practice/session');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.dark,
                        mb: 1
                    }}
                >
                    Настройки практики
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Выберите параметры для тренировки
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                {/* Режим */}
                <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            mb: 2,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <School fontSize="small" /> Режим выполнения
                    </FormLabel>
                    <RadioGroup
                        row={!isMobile}
                        value={settings.mode}
                        onChange={(e) => setSettings({...settings, mode: e.target.value as 'practice' | 'exam'})}
                    >
                        <FormControlLabel
                            value="practice"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body1">Тренировка</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Можно оставлять комментарии, нет ограничений по времени
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value="exam"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body1">Экзамен</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Только ответы, есть таймер
                                    </Typography>
                                </Box>
                            }
                        />
                    </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                {/* Тип заданий */}
                <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            mb: 2,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Psychology fontSize="small" /> Тип заданий
                    </FormLabel>
                    <RadioGroup
                        value={settings.taskType}
                        onChange={(e) => setSettings({...settings, taskType: e.target.value})}
                    >
                        {taskTypes.map(type => (
                            <FormControlLabel
                                key={type.id}
                                value={type.id}
                                control={<Radio />}
                                label={
                                    <Box>
                                        <Typography variant="body1">{type.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {type.description}
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                {/* Количество заданий */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Количество заданий: {settings.count}
                    </Typography>
                    <Slider
                        value={settings.count}
                        onChange={(_, val) => setSettings({...settings, count: val as number})}
                        min={1}
                        max={15}
                        marks={[
                            { value: 1, label: '1' },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' },
                            { value: 15, label: '15' }
                        ]}
                        sx={{
                            color: theme.palette.primary.main,
                            '& .MuiSlider-markLabel': {
                                fontSize: '0.75rem'
                            }
                        }}
                    />
                </Box>

                {/* Сложность */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Сложность
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {(['easy', 'medium', 'hard'] as const).map((level) => (
                            <Chip
                                key={level}
                                label={
                                    level === 'easy' ? 'Начальный' :
                                        level === 'medium' ? 'Средний' : 'Продвинутый'
                                }
                                onClick={() => setSettings({...settings, difficulty: level})}
                                color={settings.difficulty === level ? 'primary' : 'default'}
                                sx={{
                                    bgcolor: settings.difficulty === level
                                        ? theme.palette.primary.main
                                        : 'action.hover',
                                    color: settings.difficulty === level
                                        ? 'text.primary'
                                        : 'text.secondary',
                                    fontWeight: settings.difficulty === level ? 600 : 400,
                                    px: 2,
                                    py: 2
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Подсказки - переключатель */}
                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.showHints}
                                onChange={(e) => setSettings({...settings, showHints: e.target.checked})}
                                color="primary"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Lightbulb fontSize="small" sx={{ color: theme.palette.primary.main }} />
                                <Box>
                                    <Typography variant="body1">Показывать подсказки</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Подсказки помогут вспомнить правило
                                    </Typography>
                                </Box>
                            </Box>
                        }
                        labelPlacement="end"
                    />
                </Box>
            </Paper>

            {/* Информация о комментариях (всегда активны) */}
            <Alert
                severity="info"
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'action.hover'
                }}
                icon={<Psychology />}
            >
                <AlertTitle>Комментарии к ответам</AlertTitle>
                <Typography variant="body2">
                    В тренировочном режиме вы сможете оставлять комментарии к каждому ответу.
                    Это поможет AI точнее проанализировать ошибки.
                </Typography>
            </Alert>

            {/* Кнопки */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    onClick={() => router.back()}
                >
                    Назад
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={handleStart}
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        color: 'text.primary',
                        '&:hover': {
                            bgcolor: theme.palette.primary.dark
                        },
                        px: 4
                    }}
                >
                    Начать практику
                </Button>
            </Box>
        </Container>
    );
}