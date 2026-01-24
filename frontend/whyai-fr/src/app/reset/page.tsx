import { Suspense } from 'react';
import ResetPage from './ResetPage'; // это уже клиентский компонент с `use client` сверху

export default function Page() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <ResetPage />
        </Suspense>
    );
}