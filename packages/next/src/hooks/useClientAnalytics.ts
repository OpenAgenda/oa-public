import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import type { AgendaSettingsTracking } from 'types';
import addGoogleAnalyticsTracker from '../utils/addGoogleAnalyticsTracker';
import { addMatomoClientTracker } from '../utils/addMatomoTracker';

export default function useClientAnalytics(trackingsSettings: AgendaSettingsTracking): string | null {
  const [cookies] = useCookies();

  useEffect(() => {
    if (!trackingsSettings) {
      return;
    }

    const {
      googleAnalytics,
      matomoUrl,
      matomoSiteId,
      matomoAskForConsent,
      matomoCustom,
    } = trackingsSettings;

    if (googleAnalytics && cookies.GaCookieConsent === 'true') {
      addGoogleAnalyticsTracker({ googleAnalyticsID: googleAnalytics });
    }
    if (matomoUrl && matomoSiteId) {
      if (!matomoAskForConsent || (matomoAskForConsent && cookies.MatomoCookieConsent === 'true')) {
        addMatomoClientTracker({ matomoUrl, matomoSiteId, matomoCustom });
      }
    }
  }, [cookies.GaCookieConsent, cookies.MatomoCookieConsent, trackingsSettings]);

  if (cookies.GaCookieConsent === undefined && trackingsSettings?.googleAnalytics) {
    return 'ga';
  }

  if (cookies.MatomoCookieConsent === undefined && trackingsSettings?.matomoAskForConsent) {
    return 'matomo';
  }

  return null;
}
