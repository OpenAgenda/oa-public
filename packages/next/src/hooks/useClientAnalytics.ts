import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import type { AgendaSettingsTracking } from 'types';
import addGoogleAnalyticsTracker from 'utils/addGoogleAnalyticsTracker';
import { addMatomoClientTracker } from 'utils/addMatomoTracker';

export default function useClientAnalytics(trackingSettings: AgendaSettingsTracking): string | null {
  const [cookies] = useCookies();

  useEffect(() => {
    if (!trackingSettings) {
      return;
    }

    const {
      googleAnalytics,
      matomoUrl,
      matomoSiteId,
      matomoAskForConsent,
      matomoCustom,
    } = trackingSettings;

    if (googleAnalytics && cookies.GaCookieConsent === 'true') {
      addGoogleAnalyticsTracker({ googleAnalyticsID: googleAnalytics });
    }
    if (matomoUrl && matomoSiteId) {
      if (!matomoAskForConsent || (matomoAskForConsent && cookies.MatomoCookieConsent === 'true')) {
        addMatomoClientTracker({ matomoUrl, matomoSiteId, matomoCustom });
      }
    }
  }, [cookies.GaCookieConsent, cookies.MatomoCookieConsent, trackingSettings]);

  if (cookies.GaCookieConsent === undefined && trackingSettings?.googleAnalytics) {
    return 'ga';
  }

  if (cookies.MatomoCookieConsent === undefined && trackingSettings?.matomoAskForConsent) {
    return 'matomo';
  }

  return null;
}
