import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import * as locales from '../../src/locales-compiled/index.js';

const lang = 'fr';

export default (Story) => (
  <IntlProvider
    key={lang}
    locale={lang}
    // eslint-disable-next-line import/namespace
    messages={locales[lang]}
    defaultLocale={getSupportedLocale(lang)}
  >
    <Story />
  </IntlProvider>
);
