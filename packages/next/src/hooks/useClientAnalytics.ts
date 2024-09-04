import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import useLocalStorageState from 'use-local-storage-state';
import type { AgendaSettingsTracking } from 'types';
import addGoogleAnalyticsTracker from 'utils/addGoogleAnalyticsTracker';
import { addMatomoClientTracker } from 'utils/addMatomoTracker';

type ConsentSource = 'cookies' | 'localStorage';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export default function useClientAnalytics(
  trackingSettings: AgendaSettingsTracking,
  consentSource: ConsentSource = 'cookies',
): string | null {
  const [cookies] = useCookies();
  const [gaLocalStorageConsent] = useLocalStorageState<string | null>(
    'GaCookieConsent',
  );
  const [matomoLocalStorageConsent] = useLocalStorageState<string | null>(
    'MatomoCookieConsent',
  );

  const gaConsent =
    consentSource === 'cookies'
      ? cookies.GaCookieConsent
      : gaLocalStorageConsent;
  const matomoConsent =
    consentSource === 'cookies'
      ? cookies.MatomoCookieConsent
      : matomoLocalStorageConsent;

  const storageAvailable = isLocalStorageAvailable();

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

    if (!storageAvailable || (googleAnalytics && gaConsent === 'true')) {
      addGoogleAnalyticsTracker({ googleAnalyticsID: googleAnalytics });
    }

    if (matomoUrl && matomoSiteId) {
      if (
        !storageAvailable ||
        !matomoAskForConsent ||
        (matomoAskForConsent && matomoConsent === 'true')
      ) {
        addMatomoClientTracker({ matomoUrl, matomoSiteId, matomoCustom });
      }
    }
  }, [trackingSettings, gaConsent, matomoConsent, storageAvailable]);

  if (consentSource === 'localStorage' && !storageAvailable) {
    return null;
  }

  if (
    (gaConsent === undefined || gaConsent === null) &&
    trackingSettings?.googleAnalytics
  ) {
    return 'ga';
  }

  if (
    (matomoConsent === undefined || matomoConsent === null) &&
    trackingSettings?.matomoAskForConsent
  ) {
    return 'matomo';
  }

  return null;
}
