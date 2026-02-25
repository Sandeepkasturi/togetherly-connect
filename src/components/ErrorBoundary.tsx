import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF375F]/10 rounded-full blur-[120px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="max-w-md w-full relative z-10"
                    >
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-8 text-center shadow-2xl backdrop-blur-3xl overflow-hidden relative">
                            {/* Inner highlight */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                                className="w-20 h-20 bg-gradient-to-br from-[#FF375F] to-[#FF9F0A] rounded-[24px] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,55,95,0.4)] border border-white/20 mb-8"
                            >
                                <AlertTriangle className="w-10 h-10 text-white" />
                            </motion.div>

                            <div className="space-y-3 mb-8">
                                <h1 className="text-[28px] font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    System Interruption
                                </h1>
                                <p className="text-[14px] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                                    A temporary anomaly occurred in the neural link. Our diagnostics suggest a quick reboot will clear this up.
                                </p>
                            </div>

                            {this.state.error && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="bg-black/40 p-4 rounded-[20px] text-left overflow-auto max-h-32 text-[11px] font-mono text-[#FF375F] border border-[#FF375F]/20 mb-8 w-full shadow-inner"
                                >
                                    {this.state.error.message}
                                </motion.div>
                            )}

                            <div className="flex flex-col gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={this.handleReload}
                                    className="w-full h-14 bg-white text-black rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Reboot Protocol
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={this.handleGoHome}
                                    className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                                >
                                    <Home className="w-5 h-5 opacity-70" />
                                    Return to Core
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
