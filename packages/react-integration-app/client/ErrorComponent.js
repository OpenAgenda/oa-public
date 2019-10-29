import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';

const defaultMessages = {
  en: {
    oops: 'Oops !',
    sorry: 'Sorry, an error has occurred.',
    goToHome: 'Go to home',
    contactSupport: 'Contact support'
  },
  fr: {
    oops: 'Oops !',
    sorry: 'Désolé, une erreur s\'est produite.',
    goToHome: 'Aller à l\'accueil',
    contactSupport: 'Contacter le support'
  }
};

export default function ErrorComponent({ error, lang = 'en', messages = defaultMessages }) {
  return (
    <IntlProvider messages={messages[lang]} locale={lang} key={lang}>
      <div className="text-center">
        <h1>
          <FormattedMessage
            id="oops"
            defaultMessage="Oops !"
          />
        </h1>
        <h2>
          <FormattedMessage
            id="sorry"
            defaultMessage="Sorry, an error has occurred."
          />
        </h2>
        <div className="margin-v-md">
          <em>{error.message}</em>
        </div>
        <div className="margin-v-md">
          <a
            href="/"
            className="btn btn-primary"
          >
            <FormattedMessage
              id="goToHome"
              defaultMessage="Go to home"
            />
          </a>
          {' '}
          <a
            href="/support"
            className="btn btn-default"
          >
            <FormattedMessage
              id="contactSupport"
              defaultMessage="Contact support"
            />
          </a>
        </div>
      </div>
    </IntlProvider>
  );
}
