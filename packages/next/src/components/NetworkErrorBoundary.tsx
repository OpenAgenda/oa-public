import { Component, ErrorInfo, ReactNode } from 'react';
import checkIsNetworkError from 'utils/checkIsNetworkError';
import { logError, logWarning } from 'utils/sentry';

interface NetworkErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { error: Error; resetError: () => void }) => ReactNode;
}

interface NetworkErrorBoundaryState {
  hasError: boolean;
  isNetworkError: boolean;
  error: Error | null;
}

class NetworkErrorBoundary extends Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isNetworkError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): NetworkErrorBoundaryState {
    return {
      hasError: true,
      isNetworkError: checkIsNetworkError(error),
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (checkIsNetworkError(error)) {
      logWarning(error, { errorInfo });
    } else {
      logError(error, { errorInfo });
      throw error;
    }
  }

  resetError = () => {
    this.setState({ hasError: false, isNetworkError: false, error: null });
  };

  render() {
    const { hasError, isNetworkError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && isNetworkError && error) {
      return fallback({ error, resetError: this.resetError });
    }

    return children;
  }
}

export default NetworkErrorBoundary;
