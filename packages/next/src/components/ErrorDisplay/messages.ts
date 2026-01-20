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
  chunkError: {
    id: 'next.components.ErrorDisplay.chunkError',
    defaultMessage: 'Network issue',
  },
  chunkErrorMsg: {
    id: 'next.components.ErrorDisplay.chunkErrorMsg',
    defaultMessage:
      'The app could not be loaded due to network issues. Check your internet connection and try again. If the issue persists, contact support.',
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
