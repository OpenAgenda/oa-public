import React from 'react';
import ReactDom from 'react-dom';
import { getCookieConsentValue } from 'react-cookie-consent';
import debug from 'debug';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import ConsentBanner from '@openagenda/react-shared/lib/components/ConsentBanner';
import sharedLocales from '@openagenda/react-shared/lib/locales-compiled';
import { IntlProvider } from 'react-intl';
import appLocales from '../../locales-compiled';

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

  const cookieBannerLink = `https://support.google.com/analytics/answer/6004245?hl=${lang}`;

  const mergedLocales = mergeLocales(appLocales, sharedLocales);

  return ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={mergedLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <ConsentBanner onAccept={onConsentConfirmed} lang={lang} link={cookieBannerLink} />
    </IntlProvider>,
    div
  );
};
