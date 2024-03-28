import { IntlProvider } from 'react-intl';
import { locales as sharedLocales } from '@openagenda/react-shared';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import eventFormLocales from '../../src/locales';

const lang = 'fr';

export default Story => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={mergeLocales(sharedLocales, eventFormLocales)[lang]}
    defaultLocale={getSupportedLocale(lang)}
  >
    <Story />
  </IntlProvider>
);
