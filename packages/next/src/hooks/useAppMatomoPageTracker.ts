'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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

  if (agendasSearchUrlRegex.test(cleanUrl)) return 'agendas-search';
  if (agendaShowUrlRegex.test(cleanUrl)) return 'agenda';
  if (eventShowUrlRegex.test(cleanUrl)) return 'event';
  if (embedAgendaUrlRegex.test(cleanUrl)) return 'embed-agenda';
  if (embedEventUrlRegex.test(cleanUrl)) return 'embed-event';
  if (strapiUrlRegex.test(cleanUrl)) return 'strapi';

  if (cleanUrl === '/') return 'home';

  const segments = cleanUrl.split('/').filter(Boolean);
  return segments.length > 0 ? segments[0] : 'unknown';
}

export default function useAppMatomoPageTracker() {
  const pathname = usePathname();
  const isInitialPageTracked = useRef(false);

  useEffect(() => {
    const trackPage = () => {
      try {
        const tracker = getOpenAgendaTracker();
        if (!tracker) return;

        const category = getPageCategory(pathname);
        tracker.trackEvent('Navigation', 'Page View', category, 1);
      } catch (error) {
        console.error('Matomo page tracking error:', error);
      }
    };

    if (!isInitialPageTracked.current) {
      executeWhenMatomoReady(() => {
        trackPage();
        isInitialPageTracked.current = true;
      });
    } else {
      trackPage();
    }
  }, [pathname]);
}
