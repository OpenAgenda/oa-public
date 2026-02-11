import { defineMessages } from 'react-intl';

export default defineMessages({
  internalError: {
    id: 'next.components.ErrorDisplay.internalError',
    defaultMessage: 'Internal error',
  },
  internalErrorMsg: {
    id: 'next.components.ErrorDisplay.internalErrorMsg',
    defaultMessage: 'If the problem persists, please contact support.',
  },
  contactSupport: {
    id: 'next.components.ErrorDisplay.contactSupport',
    defaultMessage: 'Contact support',
  },
  errorTrackingId: {
    id: 'next.components.ErrorDisplay.errorTrackingId',
    defaultMessage: 'Error tracking id',
  },
  retry: {
    id: 'next.components.ErrorDisplay.retry',
    defaultMessage: 'Retry',
  },
  backToHome: {
    id: 'next.components.ErrorDisplay.backToHome',
    defaultMessage: 'Back to home',
  },
  networkError: {
    id: 'next.components.ErrorDisplay.networkError',
    defaultMessage: 'Connection error',
  },
  networkErrorMsg: {
    id: 'next.components.ErrorDisplay.networkErrorMsg',
    defaultMessage:
      'Unable to load the page. Please check your internet connection and try again.',
  },
  pageNotFound: {
    id: 'next.components.ErrorDisplay.pageNotFound',
    defaultMessage: 'Page not found',
  },
  pageNotFoundMsg: {
    id: 'next.components.ErrorDisplay.pageNotFoundMsg',
    defaultMessage:
      'The page you requested doesn’t exist or is no longer available.',
  },
});
