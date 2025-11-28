import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-xl p-8 text-center space-y-6 shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                            <p className="text-gray-400">
                                We encountered an unexpected error. Don't worry, you can try reloading the page to fix it.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-black/50 p-4 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-red-400 border border-red-500/20">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <Button
                            onClick={this.handleReload}
                            className="w-full bg-white text-black hover:bg-gray-200 font-semibold h-12"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
