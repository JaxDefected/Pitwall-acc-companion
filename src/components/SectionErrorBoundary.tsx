import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Section-level error boundary that shows an inline recovery card
 * instead of crashing the entire application.
 * 
 * Use this to wrap individual sections (setup viewer, AI engineer, etc.)
 * so a failure in one section doesn't take down the whole app.
 */
class SectionErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SectionErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-red-200 rounded-lg p-6 text-center shadow-sm">
          <div className="bg-red-50 text-red-500 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 mb-1">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
            {this.props.fallbackMessage || 'This section encountered an error. Try resetting or refreshing the page.'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-left bg-zinc-50 border border-zinc-200 rounded p-3 mb-4 overflow-auto max-h-24 text-[10px] font-mono text-red-600">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
