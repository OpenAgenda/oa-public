import React from 'react';
import ReactDom from 'react-dom';
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import debug from 'debug';
import du from '@openagenda/dom-utils';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import locales from '../../locales-compiled';

const log = debug('trackConsent');

const messages = defineMessages({
  informationText: {
    id: 'trackConsent.informationText',
    defaultMessage: 'This agenda uses cookies from the Google Analytics tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?'
  },
  moreInfoLink: {
    id: 'trackConsent.moreInfoLink',
    defaultMessage: 'Click here for more information'
  },
  decline: {
    id: 'trackConsent.decline',
    defaultMessage: 'Decline'
  },
  accept: {
    id: 'trackConsent.accept',
    defaultMessage: 'Accept'
  }
});

function ConsentBanner({ onAccept, lang }) {
  const m = useIntl().formatMessage;
  log('rendering consent banner');
  return (
    <CookieConsent
      location="bottom"
      disableButtonStyles
      disableDeclineButtonStyles
      enableDeclineButton
      buttonText={m(messages.accept)}
      declineButtonText={m(messages.decline)}
      style={{
        background: '#413a42'
      }}
      buttonClasses="btn btn-primary margin-right-sm"
      declineButtonClasses="btn btn-danger margin-right-sm"
      buttonWrapperClasses="margin-v-md margin-h-sm"
      onAccept={onScroll => onScroll ? null : onAccept()}
      expires={100}
    >
      {m(messages.informationText)} 
      <div className="margin-top-xs">
        <a
          href={`https://support.google.com/analytics/answer/6004245?hl=${lang}`}
          target="_blank"
        >
          {m(messages.moreInfoLink)}
        </a>
      </div>
    </CookieConsent>
  );
}

export default function trackConsent({ googleAnalyticsID, lang }, { onConsentConfirmed }) {
  if (!googleAnalyticsID) return;

  const consentValue = getCookieConsentValue();
  log('cookie consent value', consentValue);

  if (consentValue) {
    onConsentConfirmed();
    return;
  }

  if (consentValue === false) {
    return;
  }

  const div = document.createElement('div');
  du.el('body').appendChild(div);

  return ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <ConsentBanner onAccept={onConsentConfirmed} />
    </IntlProvider>,
    div
  );
}