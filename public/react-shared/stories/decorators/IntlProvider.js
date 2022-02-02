import React from 'react';
import { IntlProvider } from 'react-intl';

import locales from '../../src/locales-compiled';

const lang = 'fr';

export default Story => (
  <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
    <Story />
  </IntlProvider>
);
