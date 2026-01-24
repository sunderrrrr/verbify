'use client';
import {AppBar as MuiAppBar, Box, Button, Toolbar} from '@mui/material';
import {useAuthStore} from '../_stores/authStore';
import NextLink from 'next/link';
import Image from 'next/image';
import {LogoutButton} from "@/app/_components/logout";
import {UserButton} from "@/app/_components/user";
import theme from '../_config/theme';
import {Home} from "@mui/icons-material";

export default function AppBar() {
    const { token } = useAuthStore();

    return (
        <MuiAppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: theme.palette.primary.main,
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
            }}
        >
            <Toolbar sx={{
                justifyContent: 'space-between',

            }}>
                {/* Левый блок - Логотип и основные кнопки */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Image
                        src="/whyai-logo (1).png"
                        alt="WhyAI"
                        width={60}
                        height={60}
                        priority
                        style={{
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    />

                    {token && (
                        <>
                            <Button
                                color="inherit"
                                component={NextLink}
                                startIcon={<Home fontSize="medium" />}
                                href="/"
                                sx={{
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >

                            </Button>
                            <LogoutButton />
                        </>
                    )}
                </Box>


                <Box>
                    {!token ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                color="inherit"
                                component={NextLink}
                                href="/login"
                                sx={{
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                Вход
                            </Button>
                            <Button
                                color="inherit"
                                component={NextLink}
                                href="/register"
                                sx={{
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                Регистрация
                            </Button>
                        </Box>
                    ) : (
                        <UserButton />
                    )}
                </Box>
            </Toolbar>
        </MuiAppBar>
    );
}