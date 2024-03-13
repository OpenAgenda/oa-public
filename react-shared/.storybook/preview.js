import { initialize, mswLoader } from 'msw-storybook-addon';
import dedent from 'dedent';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

initialize({
  onUnhandledRequest({ method, url }) {
    const sameOrigin = url.origin === window.location.origin;

    if (sameOrigin && url.pathname === '/index.json') return;
    if (sameOrigin && url.pathname === '/runtime-error') return;
    if (sameOrigin && url.pathname.endsWith('.iframe.bundle.js')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.json')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.js')) return;

    if (sameOrigin && url.pathname.startsWith('/static')) return;

    if (
      ['unpkg.com', 'amazonaws.com'].filter(h => url.hostname.indexOf(h) !== -1)
        .length
    ) return;

    console.log('Unhandled URL', url);

    // eslint-disable-next-line no-console
    console.error(
      dedent(`Unhandled ${method} request to ${url}

      This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

      If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
    `),
    );
  },
});

export const loaders = [mswLoader];
