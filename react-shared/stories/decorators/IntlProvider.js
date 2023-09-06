import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import locales from '../../src/locales-compiled';

const lang = 'fr';

export default Story => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={locales[lang]}
    defaultLocale={getSupportedLocale(lang)}
  >
    <Story />
  </IntlProvider>
);
