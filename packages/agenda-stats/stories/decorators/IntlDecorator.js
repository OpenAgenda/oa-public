import { IntlProvider } from 'react-intl';
import * as locales from '../../src/locales/index.mjs';

export default (storyFn) => (
  <IntlProvider messages={locales.fr} locale="fr" key="fr">
    {storyFn()}
  </IntlProvider>
);
