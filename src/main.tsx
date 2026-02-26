import { createRoot } from 'react-dom/client'
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'




// Unregister old caching service workers (PWA cleanup)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
            if (reg.active && !reg.active.scriptURL.endsWith('push-sw.js')) {
                reg.unregister().then(() => {
                    console.log('Unregistered old PWA caching service worker safely.');
                });
            }
        }
    });
}

const bootStep = (step: string) => {
    console.log(`[BOOT] ${step}`);
    const fallback = document.getElementById('boot-fallback-status');
    if (fallback) fallback.innerText = step;
};

if (typeof window !== 'undefined') {
    (window as any).bootStep = bootStep;
    bootStep('Initializing Logger...');

    window.onerror = (msg, url, lineNo, columnNo, error) => {
        bootStep(`CRITICAL: ${msg}`);
        console.group('%c Togetherly Critical Error ', 'background: #FF453A; color: white; font-weight: bold; border-radius: 4px; padding: 2px 6px;');
        console.error('Message:', msg);
        console.error('URL:', url);
        console.error('Line:', lineNo, 'Column:', columnNo);
        console.error('Stack:', error?.stack);
        console.groupEnd();
        return false;
    };
}

bootStep('Mounting App...');
const rootElement = document.getElementById("root");
if (!rootElement) {
    bootStep('ERROR: #root not found');
} else {
    createRoot(rootElement).render(
        <ErrorBoundary>
            <App />
            <SpeedInsights />
        </ErrorBoundary>
    );
    bootStep('App Mounted');
    if ((window as any).dismissFallback) (window as any).dismissFallback();
}
