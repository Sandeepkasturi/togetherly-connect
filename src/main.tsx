import { createRoot } from 'react-dom/client'
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.tsx'
import './index.css'

import ErrorBoundary from './components/ErrorBoundary.tsx'

// ── Global Error Logger for Debugging ────────────────────────
if (typeof window !== 'undefined') {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
        console.group('%c Togetherly Critical Error ', 'background: #FF453A; color: white; font-weight: bold; border-radius: 4px; padding: 2px 6px;');
        console.error('Message:', msg);
        console.error('URL:', url);
        console.error('Line:', lineNo, 'Column:', columnNo);
        console.error('Stack:', error?.stack);
        console.groupEnd();
        return false;
    };
}

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
        <SpeedInsights />
    </ErrorBoundary>
);
