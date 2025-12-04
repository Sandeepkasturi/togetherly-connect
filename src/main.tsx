import { createRoot } from 'react-dom/client'
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.tsx'
import './index.css'

import ErrorBoundary from './components/ErrorBoundary.tsx'

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
        <SpeedInsights />
    </ErrorBoundary>
);
