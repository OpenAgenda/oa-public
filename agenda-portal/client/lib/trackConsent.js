import { createRoot } from 'react-dom/client';
import { getCookieConsentValue } from 'react-cookie-consent';
import { IntlProvider } from 'react-intl';
import ConsentBanner from '@openagenda/react-shared/dist/components/ConsentBanner.js';

export default (
  { lang, locales, cookieBannerLink },
  { onConsentConfirmed },
) => {
  const consentValue = getCookieConsentValue();

  if (consentValue === 'false') {
    return;
  }

  if (consentValue) {
    onConsentConfirmed();
    return;
  }

  const div = document.createElement('div');
  document.querySelector('body').appendChild(div);

  const styles = {
    buttonWrapperClasses: 'btn-wrapper',
    containerClasses: 'banner-container',
    buttonClasses: 'accept-btn btn btn-primary',
    declineButtonClasses: 'decline-btn btn btn-danger',
    contentClasses: 'banner-content',
    location: 'none',
  };

  const root = createRoot(div);
  return root.render(
    <IntlProvider locale={lang} key={lang}>
      <ConsentBanner
        onAccept={onConsentConfirmed}
        customMessages={locales[lang]}
        customStyle={styles}
        lang={lang}
        link={cookieBannerLink}
      />
    </IntlProvider>,
  );
};
