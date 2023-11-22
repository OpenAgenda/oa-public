import { useEffect } from 'react';
import { addMatomoTracker } from 'utils/addMatomoTracker';

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

export default function useMatomoTracker() {
  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID) {
      return;
    }

    addMatomoTracker({
      matomoUrl: MATOMO_URL,
      matomoSiteId: MATOMO_SITE_ID,
    });
  }, []);
};
