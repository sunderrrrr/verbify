import { Suspense } from 'react';
import ChatPage from './ChatPage';

export default function Page() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <ChatPage />
        </Suspense>
    );
}