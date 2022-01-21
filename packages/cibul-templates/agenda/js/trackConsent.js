import React from 'react';
import ReactDom from 'react-dom';
import { getCookieConsentValue } from "react-cookie-consent";
import debug from 'debug';
import ConsentBanner from '@openagenda/react-shared/lib/components/ConsentBanner';
import { IntlProvider } from 'react-intl';
import locales from '../../locales-compiled';

const log = debug('trackConsent');

export default ({ googleAnalyticsID, lang }, { onConsentConfirmed }) => {
  if (!googleAnalyticsID) return;

  const consentValue = getCookieConsentValue();
  log('cookie consent value', consentValue);

  if (consentValue === false) {
    return;
  }

  if (consentValue) {
    onConsentConfirmed();
    return;
  }

  const div = document.createElement('div');
  document.querySelector('body').appendChild(div);

  const cookieBannerLink = `https://support.google.com/analytics/answer/6004245?hl=${lang}`

  return ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <ConsentBanner onAccept={onConsentConfirmed} lang={lang} link={cookieBannerLink} />
    </IntlProvider>,
    div
  );
};