'use client';

import {Box, Button, Container, Paper, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/system';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InsightsIcon from '@mui/icons-material/Insights';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupsIcon from '@mui/icons-material/Groups';
import {ArrowForward} from '@mui/icons-material';
import Link from 'next/link';
import {motion} from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const MotionBox = motion(Box);

export default function LandingPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const features = [
        { icon: <ChatIcon fontSize="large" color="primary" />, title: "Чат-бот", desc: "Разберёт любое задание ЕГЭ и ответит на вопросы 24/7." },
        { icon: <AssignmentTurnedInIcon fontSize="large" color="primary" />, title: "ИИ-Проверка сочинения", desc: "Даст подробный разбор и рекомендации по улучшению." },
        { icon: <InsightsIcon fontSize="large" color="primary" />, title: "Анализ подготовки ученика", desc: "(В разработке): Отслеживание прогресса подготовки и персональный анализ" },
    ];

    const advantages = [
        { icon: <ScheduleIcon color="primary" />, text: "Доступно в любое время и в любом месте" },
        { icon: <AutoAwesomeIcon color="primary" />, text: "Обученный ИИ с адаптацией под каждое задание" },
        { icon: <SchoolIcon color="primary" />, text: "Задания в формате ЕГЭ с упором на практику" },
    ];

    const teacherBenefits = [
        { icon: <AssignmentTurnedInIcon color="primary" />, text: "Автоматизация проверки рутинных заданий" },
        { icon: <GroupsIcon color="primary" />, text: "Больше времени для индивидуальной работы с учениками" },
        { icon: <InsightsIcon color="primary" />, text: "Ведется разработка модуля анализа успеваемости ученика" },
    ];

    const steps = [
        "Выбираешь задание или тему",
        "Задаёшь вопрос или пишешь сочинение",
        "Получаешь разбор и советы",
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6, px: { xs: 2, sm: 4 } }}>

            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ textAlign: 'center', mb: 8, mt: 5}}>
                <Typography variant="h1" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight:1000,  fontSize: isMobile ? '1.25rem' : '2.5rem'  }}>
                    Подготовка к ЕГЭ с <br/><Box component="span" sx={{ color: theme.palette.primary.main, fontWeight:1000,  fontSize: isMobile ? '1.25rem' : '2.5rem'  }}>Verbify</Box>
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, maxWidth: 700, mx: 'auto', mb: 4, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                    Помощник в подготовке: объяснит сложные задания, проверит сочинение и поможет закрепить знания.
                </Typography>
                <Button variant="contained" size="large" component={Link} href="/login" sx={{
                    borderRadius: 3, px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    '&:hover': { bgcolor: theme.palette.primary.light || theme.palette.primary.main, '.MuiSvgIcon-root': { transform: 'translateX(5px)' } },
                    transition: 'all 0.3s ease'
                }}>
                    Начать подготовку <ArrowForward sx={{ ml: 1, transition: '0.3s' }} />
                </Button>
            </MotionBox>


            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, mb: 8 }}>
                {features.map((f, i) => (
                    <Paper key={i} elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: theme.palette.background.paper, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-6px) scale(1.03)', boxShadow: 6 } }}>
                        <Box sx={{ mb: 2 }}>{f.icon}</Box>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: theme.palette.text.primary }}>{f.title}</Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>{f.desc}</Typography>
                    </Paper>
                ))}
            </MotionBox>


            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Почему Verbify?</Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mt: 3, justifyContent: 'center' }}>
                    {advantages.map((a, i) => (
                        <Paper key={i} elevation={1} sx={{ flex: 1, p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: theme.palette.background.paper, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            {a.icon}
                            <Typography variant="body1" fontWeight={600} sx={{ color: theme.palette.text.primary }}>{a.text}</Typography>
                        </Paper>
                    ))}
                </Box>
            </MotionBox>

            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ mb: 8 }}>
                <Paper elevation={2} sx={{ p: 4, borderRadius: 3, bgcolor: theme.palette.primary.light, mx: 'auto', textAlign: 'center', padding: 5 }}>
                    <SchoolIcon sx={{ fontSize: 40, mb: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h5" fontWeight={1000} sx={{ mb: 2, color: theme.palette.text.primary }}>
                        При поддержке педагогов
                    </Typography>
                    <Typography variant="body1" color={theme.palette.text.secondary} fontSize={14}>
                        При разработке Verbify мы советовались и работали с лучшими педагогами, ученики которых ежегодно становятся <b>стобальниками</b>
                    </Typography>
                </Paper>
            </MotionBox>

            {/* Новый блок для учителей */}
            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: theme.palette.text.primary }}>
                    Verbify — помощник и для учителей
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, color: theme.palette.text.secondary }}>
                    Снижаем нагрузку и повышаем эффективность преподавания
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'center' }}>
                    {teacherBenefits.map((benefit, i) => (
                        <Paper key={i} elevation={2} sx={{ flex: 1, p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: theme.palette.background.paper, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            {benefit.icon}
                            <Typography variant="body1" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
                                {benefit.text}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </MotionBox>

            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ textAlign: 'center', mb: 8 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: theme.palette.background.paper, transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                    <Typography variant="h2" sx={{ color: theme.palette.text.primary }}>Как это работает?</Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, mt: 3, justifyContent: 'center' }}>
                        {steps.map((step, i) => (
                            <Box key={i} sx={{ flex: 1, p: 3, textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 800, mb: 1 }}>{i + 1}</Typography>
                                <Typography variant="body1" color={theme.palette.text.secondary}>{step}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </MotionBox>


            <MotionBox initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>Готовы повысить эффективность подготовки?</Typography>
                <Button variant="contained" size="large" component={Link} href="/login" sx={{
                    borderRadius: 3, px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    '&:hover': { bgcolor: theme.palette.secondary.dark || theme.palette.primary.main },
                }}>
                    Присоединиться
                </Button>
            </MotionBox>

        </Container>
    );
}