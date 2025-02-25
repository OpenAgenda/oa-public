import { initialize, mswLoader } from 'msw-storybook-addon';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

initialize({
  onUnhandledRequest({ request, print }) {
    const url = new URL(request.url);
    const sameOrigin = url.origin === window.location.origin;

    if (sameOrigin && url.pathname === '/index.json') return;
    if (sameOrigin && url.pathname === '/runtime-error') return;
    if (sameOrigin && url.pathname.endsWith('.iframe.bundle.js')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.json')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.js')) return;

    if (sameOrigin && url.pathname.startsWith('/static')) return;

    if (
      ['unpkg.com', 'infomaniak.cloud'].filter(
        (h) => url.hostname.indexOf(h) !== -1,
      ).length
    )
      return;

    print.warning();
  },
});

export const loaders = [mswLoader];
