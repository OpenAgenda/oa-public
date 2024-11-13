import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';

import * as locales from '../../src/locales-compiled/index.js';

const lang = 'fr';

export default (Story) => (
  <IntlProvider
    key={lang}
    locale={lang}
    // eslint-disable-next-line import/namespace
    messages={locales.fr}
    defaultLocale={getSupportedLocale(lang)}
  >
    <div className="container">
      <div className="row">
        <div className="wsq col-md-offset-3 col-md-6 padding-all-sm">
          <Story />
        </div>
      </div>
    </div>
  </IntlProvider>
);
