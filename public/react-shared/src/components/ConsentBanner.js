import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  'trackConsent.informationText': {
    id: 'trackConsent.informationText',
    defaultMessage: 'This agenda uses cookies from the Google Analytics tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?'
  },
  'trackConsent.moreInfoLink': {
    id: 'trackConsent.moreInfoLink',
    defaultMessage: 'Click here for more information'
  },
  'trackConsent.decline': {
    id: 'trackConsent.decline',
    defaultMessage: 'Decline'
  },
  'trackConsent.accept': {
    id: 'trackConsent.accept',
    defaultMessage: 'Accept'
  }
});

const defaultStyle = {
  location: 'bottom',
  buttonClasses: 'btn btn-primary margin-right-sm',
  declineButtonClasses: 'btn btn-danger margin-right-sm',
  buttonWrapperClasses: 'margin-v-md margin-h-sm',
};

export default ({
  onAccept, customMessages = null, customStyle = null, show = false, link = ''
}) => {
  const intl = useIntl();

  const defineMessage = msg => {
    if (customMessages && customMessages[msg]) {
      return customMessages[msg];
    }
    return intl.formatMessage(messages[msg]);
  };

  const defineStyle = style => {
    if (customStyle && customStyle[style]) return customStyle[style];
    return defaultStyle[style] || '';
  };

  return (
    <CookieConsent
      visible={show ? 'show' : 'byCookieValue'}
      location={customStyle ? 'none' : 'bottom'}
      disableStyles={!!customStyle}
      enableDeclineButton
      disableButtonStyles
      disableDeclineButtonStyles
      buttonText={defineMessage('trackConsent.accept')}
      declineButtonText={defineMessage('trackConsent.decline')}
      buttonClasses={defineStyle('buttonClasses')}
      declineButtonClasses={defineStyle('declineButtonClasses')}
      buttonWrapperClasses={defineStyle('buttonWrapperClasses')}
      contentClasses={defineStyle('contentClasses')}
      containerClasses={defineStyle('containerClasses')}
      overlayClasses={defineStyle('overlayClasses')}
      onAccept={onScroll => (onScroll ? null : onAccept())}
      expires={100}
    >
      {defineMessage('trackConsent.informationText')}
      <div className="margin-top-xs">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {defineMessage('trackConsent.moreInfoLink')}
        </a>
      </div>
    </CookieConsent>
  );
};
