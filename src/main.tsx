import { createRoot } from 'react-dom/client'
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'

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
}
