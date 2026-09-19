import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8F9FA] p-6 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-earth mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            We've encountered an unexpected error. Our team has been notified. 
            Please try refreshing the application.
          </p>
          <div className="bg-white p-4 rounded-xl text-left border border-red-100 shadow-sm w-full max-w-md mb-8 overflow-auto max-h-32 text-xs text-red-800 font-mono">
            {this.state.error?.message || 'Unknown Error'}
          </div>
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then((keys) => {
                  keys.forEach((k) => caches.delete(k));
                });
              }
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  regs.forEach((r) => r.unregister());
                });
              }
              window.location.reload();
            }}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144317] text-white px-8 py-4 rounded-full font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <RefreshCw size={20} />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
