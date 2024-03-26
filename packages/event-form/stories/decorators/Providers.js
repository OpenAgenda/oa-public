import { IntlProvider } from 'react-intl';
import { locales } from '@openagenda/react-shared';

const lang = 'fr';

export default Story => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={locales[lang]}
    defaultLocale="fr"
  >
    <Story />
  </IntlProvider>
);
