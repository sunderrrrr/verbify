import {createTheme} from '@mui/material/styles';

const baseTheme = createTheme({
    palette: {
        primary: {
            main: '#fbc497',
            light: '#ffdcbe', // Светло-зелёный фон
            dark: 'rgba(210,149,82,0.71)', // Тёмно-зелёный акцент
        },
        secondary: {
            main: '#FFB300', // Тёплый жёлтый для акцентов
        },
        success: {
            main: '#76ff7d', // Зелёный для выполненных задач
        },
        background: {
            default: '#F5F5F5', // Светло-серый фон
            paper: '#FFFFFF', // Белый для карточек
        },
        text: {
            primary: '#212121', // Основной текст
            secondary: '#757575', // Вторичный текст
        },
        divider: '#BDBDBD', // Разделители
    },
    components: {


        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: '#757575',
                    '&.Mui-checked': {
                        color: '#f8c498',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'filled',
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#ffa447',
                },
                h2: {
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: '#ffa447',
                    margin: '16px 0',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
            }
        },

    },
    shape: {
        borderRadius: 10,
    },
    typography:{
        fontFamily: 'Inter, Arial, sans-serif',
        h1: {
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
        },
    },

});

export default baseTheme;