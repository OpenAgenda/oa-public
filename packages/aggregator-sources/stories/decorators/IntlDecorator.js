import { IntlProvider } from 'react-intl';
import locales from '../../src/locales';

export default Story => (
  <IntlProvider messages={locales.fr} locale="fr" key="fr">
    <Story />
  </IntlProvider>
);
