import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  getOpenAgendaTracker,
  executeWhenMatomoReady,
} from 'utils/addMatomoTracker';
import {
  agendaShowUrlRegex,
  eventShowUrlRegex,
  embedAgendaUrlRegex,
  embedEventUrlRegex,
  agendasSearchUrlRegex,
  strapiUrlRegex,
} from 'utils/isNextUrl';

function getPageCategory(url: string): string {
  const cleanUrl = url.split('?')[0];

  if (agendaShowUrlRegex.test(cleanUrl)) return 'agenda';
  if (eventShowUrlRegex.test(cleanUrl)) return 'event';
  if (embedAgendaUrlRegex.test(cleanUrl)) return 'embed-agenda';
  if (embedEventUrlRegex.test(cleanUrl)) return 'embed-event';
  if (agendasSearchUrlRegex.test(cleanUrl)) return 'agendas-search';
  if (strapiUrlRegex.test(cleanUrl)) return 'strapi';

  if (cleanUrl === '/') return 'home';

  const segments = cleanUrl.split('/').filter(Boolean);
  return segments.length > 0 ? segments[0] : 'unknown';
}

export interface PageTrackingOptions {
  debug?: boolean;
}

export default function useMatomoPageTracker(
  options: PageTrackingOptions = {},
) {
  const router = useRouter();
  const { debug = false } = options;
  const isInitialPageTracked = useRef(false);

  const trackPage = (url: string) => {
    try {
      const tracker = getOpenAgendaTracker();
      if (!tracker) {
        if (debug) {
          console.warn('Matomo tracker not available');
        }
        return;
      }

      const category = getPageCategory(url);
      tracker.trackEvent('Navigation', 'Page View', category, 1);

      if (debug) {
        console.log('Page tracked:', {
          url,
          category,
        });
      }
    } catch (error) {
      console.error('Erreur lors du tracking de page Matomo:', error);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      trackPage(router.asPath);
    };

    const trackInitialPage = () => {
      if (!isInitialPageTracked.current && router.isReady) {
        trackPage(router.asPath);
        isInitialPageTracked.current = true;
      }
    };

    executeWhenMatomoReady(trackInitialPage);

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, debug]);

  return {
    trackCustomEvent: (action: string, value?: number) => {
      try {
        const tracker = getOpenAgendaTracker();
        if (tracker) {
          const category = getPageCategory(router.asPath);
          tracker.trackEvent('Page Interaction', action, category, value);
        }
      } catch (error) {
        console.error(
          "Erreur lors du tracking d'événement personnalisé:",
          error,
        );
      }
    },
    getCurrentPageCategory: () => getPageCategory(router.asPath),
  };
}
