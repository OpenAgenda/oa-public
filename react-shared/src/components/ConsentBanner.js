import CookieConsent from 'react-cookie-consent';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  informationText: {
    id: 'ReactShared.ConsentBanner.informationText',
    defaultMessage:
      'This agenda uses cookies from the {service} tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?',
  },
  moreInfoLink: {
    id: 'ReactShared.ConsentBanner.moreInfoLink',
    defaultMessage: 'Click here for more information',
  },
  decline: {
    id: 'ReactShared.ConsentBanner.decline',
    defaultMessage: 'Decline',
  },
  accept: {
    id: 'ReactShared.ConsentBanner.accept',
    defaultMessage: 'Accept',
  },
});

const defaultStyle = {
  location: 'bottom',
  buttonClasses: 'btn btn-primary margin-right-sm',
  declineButtonClasses: 'btn btn-danger margin-right-sm',
  buttonWrapperClasses: 'margin-v-md margin-h-sm',
};

export default ({
  onAccept,
  customMessages = null,
  customStyle = null,
  show = false,
  link = '',
  consentFor = 'ga',
  cookieName,
}) => {
  const intl = useIntl();

  const defineMessage = (msg) =>
    customMessages?.[`trackConsent.${msg}`]
    ?? intl.formatMessage(messages[msg]);

  const defineStyle = (style) => {
    if (customStyle?.[style]) return customStyle[style];
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
      buttonText={defineMessage('accept')}
      declineButtonText={defineMessage('decline')}
      buttonClasses={defineStyle('buttonClasses')}
      declineButtonClasses={defineStyle('declineButtonClasses')}
      buttonWrapperClasses={defineStyle('buttonWrapperClasses')}
      contentClasses={defineStyle('contentClasses')}
      containerClasses={defineStyle('containerClasses')}
      overlayClasses={defineStyle('overlayClasses')}
      onAccept={(onScroll) => (onScroll ? null : onAccept())}
      expires={100}
      cookieName={cookieName}
    >
      {intl.formatMessage(messages.informationText, {
        service: consentFor === 'ga' ? 'Google Analytics' : 'Matomo',
      })}
      {link ? (
        <div className="margin-top-xs">
          <a href={link} target="_blank" rel="noreferrer">
            {defineMessage('moreInfoLink')}
          </a>
        </div>
      ) : null}
    </CookieConsent>
  );
};
