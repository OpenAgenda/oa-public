import { Component, ReactNode } from 'react';
import checkIsNetworkError from 'utils/checkIsNetworkError';
import { logWarning } from 'utils/sentry';

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

  componentDidCatch(error: Error, _errorInfo: any) {
    if (checkIsNetworkError(error)) {
      logWarning(error);
    } else {
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
