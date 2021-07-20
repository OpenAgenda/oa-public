import React from 'react';
import { IntlProvider } from 'react-intl';
import locales from './locales';

export default function LocationsProvider({ children, lang }) {
  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      {children}
    </IntlProvider>
  );
}
