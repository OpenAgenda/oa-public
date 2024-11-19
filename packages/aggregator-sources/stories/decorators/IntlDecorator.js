import { IntlProvider } from 'react-intl';
import * as locales from '../../src/locales/index.js';

export default (Story) => (
  <IntlProvider messages={locales.fr} locale="fr" key="fr">
    <Story />
  </IntlProvider>
);
