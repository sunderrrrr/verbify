'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './_config/theme';
import AppBar from './_components/bar';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar />
            <main>{children}</main>
        </ThemeProvider>
    );
}