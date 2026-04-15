import { headers } from 'next/headers';
import getNonce from 'utils/getNonce';
import getLocale from 'utils/getLocale';

/**
 * Outdated-browser banner. The proxy flags unsupported user-agents via the
 * `x-outdated-browser` request header. When set, we inject the stylesheet
 * and the script from /public, plus an inline init that exposes the locale.
 *
 * Rendered as the first child of <body> because `#outdated` has no
 * `position: fixed` — its placement in document flow determines where the
 * banner appears.
 *
 * Uses raw <script>/<link> (not next/script) because the browser strips
 * the `nonce` attribute from the DOM after parsing, which confuses React's
 * hydration comparison on Client Components. `suppressHydrationWarning`
 * silences the resulting diff on the nonce attribute.
 */
export default async function OutdatedBrowser() {
  const [headerStore, nonce, locale] = await Promise.all([
    headers(),
    getNonce(),
    getLocale(),
  ]);

  if (headerStore.get('x-outdated-browser') !== '1') return null;

  const nonceAttr = nonce ?? undefined;

  // Defensive escape against `</script>` injection if `locale` ever escapes
  // the SUPPORTED_LOCALES allowlist (today it can't, but inline JSON should
  // never trust its source).
  const optionsJson = JSON.stringify({ locale }).replace(/</g, '\\u003c');

  return (
    <>
      {/* React 19 hoists <link rel="stylesheet"> to <head> automatically and
          dedupes by href, so it's safe to render here. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="/css/outdated-browser.css"
        nonce={nonceAttr}
        suppressHydrationWarning
      />
      <div
        id="outdated"
        suppressHydrationWarning
        // outdated-browser.js injects its markup into this div at runtime.
        // dangerouslySetInnerHTML={{__html: ''}} tells React the children are
        // manually managed, so hydration won't reconcile them (suppressHydrationWarning
        // alone only covers one level of attributes/text, not added subtrees).
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: '' }}
      />
      <script
        nonce={nonceAttr}
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.outdatedBrowserOptions = ${optionsJson};`,
        }}
      />
      <script
        src="/js/outdated-browser.js"
        defer
        nonce={nonceAttr}
        suppressHydrationWarning
      />
    </>
  );
}
