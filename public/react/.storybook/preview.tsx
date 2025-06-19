import { useLayoutEffect } from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { SWRConfig } from 'swr';

// Initialize MSW
initialize({
  onUnhandledRequest(request, print) {
    const url = new URL(request.url);
    const sameOrigin = url.origin === window.location.origin;

    if (sameOrigin && url.pathname === '/index.json') return;
    if (sameOrigin && url.pathname === '/runtime-error') return;
    if (sameOrigin && url.pathname === '/favicon.svg') return;
    if (sameOrigin && url.pathname.endsWith('.iframe.bundle.js')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.json')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.js')) return;

    if (sameOrigin && url.pathname.startsWith('/static')) return;

    if (url.hostname === 'cdn.openagenda.com') return;

    print.warning();
  },
});

export const parameters = { layout: 'fullscreen' };

export const decorators = [
  // Clean the cache at each story change
  (Story) => (
    <SWRConfig value={{ provider: () => new Map() }}>
      <Story />
    </SWRConfig>
  ),
  // Fix uikit theme
  (Story) => {
    useLayoutEffect(() => {
      const root = document.documentElement;
      root.dataset.theme = 'light';

      return () => {
        delete root.dataset.theme;
      };
    }, []);

    return <Story />;
  },
];

export const loaders = [mswLoader];
