import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';

const defaultMessages = {
  en: {
    oops: 'Oops !',
    sorry: 'Sorry, an error has occurred.',
    goToHome: 'Go to home',
    contactSupport: 'Contact support',
    retry: 'Retry',
  },
  fr: {
    oops: 'Oups !',
    sorry: "Désolé, une erreur s'est produite.",
    goToHome: "Aller à l'accueil",
    contactSupport: 'Contacter le support',
    retry: 'Réessayer',
  },
};

const preStyle = {
  display: 'inline-block',
};

export default function ErrorComponent({
  error,
  componentStack,
  resetError,
  lang = 'en',
  messages = defaultMessages,
}) {
  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={messages[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="text-center">
        <h1>
          <FormattedMessage id="oops" defaultMessage="Oops !" />
        </h1>
        <h2>
          <FormattedMessage
            id="sorry"
            defaultMessage="Sorry, an error has occurred."
          />
        </h2>
        <div className="margin-v-md">
          {typeof window === 'undefined' ? (
            <em>{error.message}</em>
          ) : (
            <pre className="text-left text-danger" style={preStyle}>
              {`${error.message}${componentStack}`}
            </pre>
          )}
        </div>
        <div className="margin-v-md">
          <a href="/" className="btn btn-primary">
            <FormattedMessage id="goToHome" defaultMessage="Go to home" />
          </a>{' '}
          <a href="/support" className="btn btn-default">
            <FormattedMessage
              id="contactSupport"
              defaultMessage="Contact support"
            />
          </a>
          {process.env.NODE_ENV === 'development'
          && typeof resetError === 'function' ? (
            <>
              {' '}
              <button onClick={resetError} type="button" className="btn btn-default">
                <FormattedMessage id="retry" defaultMessage="Retry" />
              </button>
            </>
            ) : null}
        </div>
      </div>
    </IntlProvider>
  );
}
