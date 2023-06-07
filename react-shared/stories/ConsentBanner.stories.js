import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { IntlProvider } from 'react-intl';

import ConsentBanner from '../src/components/ConsentBanner';
import locales from '../src/locales-compiled';
import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'ConsentBanner',
  component: ConsentBanner,
  decorators: [AdminCanvas],
};

export const Default = () => {
  const [consentValue, setConsentValue] = useState(false);

  return (
    <IntlProvider locale="fr" key="fr" messages={locales.fr}>
      <ConsentBanner onAccept={() => setConsentValue(!consentValue)} show lang="fr" />
    </IntlProvider>
  );
};

export const Custom = () => {
  const [consentValue, setConsentValue] = useState(false);

  const styles = {
    buttonWrapperClasses: 'btn-wrapper pull-right',
    containerClasses: 'alert alert-warning col-lg-12 ',
    buttonClasses: 'btn btn-primary',
    declineButtonClasses: 'btn btn-danger margin-right-xs',
    contentClasses: '',
  };

  const customMessages = {
    'trackConsent.informationText': 'Cookies?',
    'trackConsent.moreInfoLink': 'Plus d\'infos',
    'trackConsent.accept': 'Oui',
    'trackConsent.decline': 'Non merci',
  };

  const CustomContent = () => (<p>Tu veux un cookie?</p>);

  return (
    <IntlProvider locale="fr" key="fr">
      <ConsentBanner onAccept={() => setConsentValue(!consentValue)} customMessages={customMessages} customStyle={styles} CustomContent={CustomContent} show lang="fr" />
    </IntlProvider>
  );
};
