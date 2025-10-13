'use client';

import {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import Link from 'next/link';

export default function TGBanner() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (Math.random() < 0.33) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>🔔 Поделитесь обратной связью!</span>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <Box display="flex" alignItems="center">
                    <Box sx={{ mr: 3, flexShrink: 0 }}>
                        <Image
                            src="/whyai-logo.png"
                            alt="Telegram"
                            width={80}
                            height={80}
                            style={{ borderRadius: '50%' }}
                        />
                    </Box>
                    <DialogContentText id="alert-dialog-description">
                        Verbify только вышел и в данный момент находится на стадии <b>бета-тестирования</b>, поэтому в работе могут происходить сбои.<br/>
                        Вы можете <b>помочь</b> нашей команде: пришлите нам скриншот сбоя и его обстоятельства <br/> Это поможет сделать наш сервис <b>лучше!</b> 😊
                    </DialogContentText>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    href="https://t.me/bkmz7692"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    sx={{ px: 4 }}>
                    Написать
                </Button>
            </DialogActions>
        </Dialog>
    );
}