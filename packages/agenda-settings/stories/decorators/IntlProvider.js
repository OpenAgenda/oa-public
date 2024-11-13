import { IntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import { locales as reactFilterLocales } from '@openagenda/react-filters';

import * as appLocales from '../../src/locales-compiled/index.js';

const locales = mergeLocales(appLocales, reactFilterLocales);

const lang = 'fr';

export default (Story) => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={locales[lang]}
    defaultLocale={getSupportedLocale(lang)}
  >
    <Story />
  </IntlProvider>
);
