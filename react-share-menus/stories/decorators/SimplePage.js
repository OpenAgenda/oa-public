import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import locales from '../../src/locales-compiled';

export default Story => {
  const lang = 'fr';

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="container centered">
        <div className="row">
          <div className="col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6 wsq padding-v-md padding-h-sm">
            <Story />
          </div>
        </div>
      </div>
    </IntlProvider>
  );
};
