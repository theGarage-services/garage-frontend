import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error logging could be sent to a monitoring service here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
          <div className="text-center p-8 max-w-[95vw] sm:max-w-md">
            <h1 className="text-2xl font-bold mb-4">
              <span className="text-slate-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
            <p className="text-gray-600 mb-4">Something went wrong with this component.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors mr-3"
            >
              Try Again
            </button>
            <button 
              onClick={() => globalThis.location.reload()}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}