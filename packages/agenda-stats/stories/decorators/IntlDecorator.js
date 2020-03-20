import React from 'react';
import { IntlProvider } from 'react-intl';
import locales from '../../src/locales';

export default storyFn => (
  <IntlProvider messages={locales.fr} locale="fr" key="fr">
    {storyFn()}
  </IntlProvider>
);
