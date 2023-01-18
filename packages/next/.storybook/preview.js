import { initialize, mswLoader } from 'msw-storybook-addon';
import { SWRConfig } from 'swr';
import NextFutureImage from 'next/future/image';
import dedent from 'dedent';

// Initialize MSW
initialize({
  onUnhandledRequest({ method, url }) {
    const sameOrigin = url.origin === window.location.origin;

    if (sameOrigin && url.pathname === '/runtime-error') return;
    if (sameOrigin && url.pathname.endsWith('.iframe.bundle.js')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.json')) return;
    if (sameOrigin && url.pathname.endsWith('.hot-update.js')) return;

    if (sameOrigin && url.pathname.startsWith('/static')) return;

    if (url.hostname === 'cibul.s3.amazonaws.com') return;
    if (url.hostname === 'cibuldev.s3.amazonaws.com') return;

    // console.log('Unhandled URL', url);

    console.error(dedent(`Unhandled ${method} request to ${url}.

      This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

      If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
    `));
  },
});

const OriginalNextFutureImage = NextFutureImage.default;

Object.defineProperty(NextFutureImage, 'default', {
  configurable: true,
  value: props => <OriginalNextFutureImage {...props} unoptimized />,
});

export const parameters = { layout: 'fullscreen' };

export const decorators = [
  storyFn => (
    <SWRConfig value={{ provider: () => new Map() }}>
      {storyFn()}
    </SWRConfig>
  ),
];

// Provide the MSW addon loader globally
export const loaders = [mswLoader];
