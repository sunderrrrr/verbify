"use client";
import { CacheProvider } from "@emotion/react";
import { ReactNode } from "react";
import createEmotionCache from "./createEmotionCache";

const clientSideCache = createEmotionCache();

export default function EmotionCacheProvider({ children }: { children: ReactNode }) {
    return (
        <CacheProvider value={clientSideCache}>
            {children}
        </CacheProvider>
    );
}
