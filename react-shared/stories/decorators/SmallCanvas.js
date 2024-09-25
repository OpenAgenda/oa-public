import { IntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';

import commonLabels from '@openagenda/common-labels';
import * as locales from '../../src/locales-compiled';

const lang = 'fr';

export default (Story) => (
  <IntlProvider
    key={lang}
    locale={lang}
    messages={mergeLocales(locales, commonLabels)[lang]}
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
