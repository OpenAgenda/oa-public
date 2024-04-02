import { IntlProvider } from 'react-intl';
import { locales as sharedLocales } from '@openagenda/react-shared';
import commonLocales from '@openagenda/common-labels';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import eventFormLocales from '../../src/locales';

const lang = 'fr';

export default Story => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={mergeLocales(sharedLocales, commonLocales, eventFormLocales)[lang]}
    defaultLocale={getSupportedLocale(lang)}
  >
    <Story />
  </IntlProvider>
);
