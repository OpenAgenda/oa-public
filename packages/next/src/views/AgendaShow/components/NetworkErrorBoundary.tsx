import { Component, ReactNode } from 'react';
import { IntlShape, injectIntl } from 'react-intl';
import NotificationModal from 'components/NotificationModal';
import messages from '../messages';

interface NetworkErrorBoundaryProps {
  intl: IntlShape;
  children: ReactNode;
  fallback?: ReactNode;
}

interface NetworkErrorBoundaryState {
  hasError: boolean;
  isNetworkError: boolean;
}

class NetworkErrorBoundary extends Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): NetworkErrorBoundaryState {
    const isNetworkError = error.message === "Can't list events";

    return {
      hasError: true,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const isNetworkError = error.message === "Can't list events";

    if (isNetworkError) {
      console.error('Network error caught:', error, errorInfo);
    } else {
      // Rethrow non-network errors to let parent ErrorBoundary (Sentry) handle them
      throw error;
    }
  }

  handleRetry = () => {
    // Reload the page to retry all network requests
    window.location.reload();
  };

  render() {
    const { hasError, isNetworkError } = this.state;
    const { children, fallback, intl } = this.props;

    if (hasError && isNetworkError) {
      return (
        <>
          {fallback}
          <NotificationModal
            onClose={() => {}}
            title={intl.formatMessage(messages.networkErrorTitle)}
            message={intl.formatMessage(messages.networkErrorMessage)}
            action={intl.formatMessage(messages.retryButton)}
            onAction={this.handleRetry}
            showCloseButton={false}
          />
        </>
      );
    }

    if (hasError && !isNetworkError) {
      // For other errors, show the fallback if provided
      return fallback || null;
    }

    return children;
  }
}

export default injectIntl(NetworkErrorBoundary);
