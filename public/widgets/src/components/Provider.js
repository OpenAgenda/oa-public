'use client';

import { useState, useEffect } from 'react';
import {
  createCache,
  themeConfig as oaThemeConfig,
  defineConfig,
  UIKitProvider,
  EnvironmentProvider,
} from '@openagenda/uikit';
import { IntlProvider } from '@openagenda/react';
import root from 'react-shadow/emotion';

const varRoot = ':host';

export const themeConfig = defineConfig({
  cssVarsRoot: varRoot,
  conditions: {
    light: `${varRoot} &, .light &`,
  },
  preflight: { scope: varRoot },
  globalCss: {
    [varRoot]: {
      ...oaThemeConfig.globalCss?.html ?? {},
      // h: '100dvh',
      // w: '100dvw',
      // top: 0,
      // left: 0,
      // position: 'fixed',

      // // Reset
      // all: 'initial',
      // all: 'initial',
      // display: 'block',
      // boxSizing: 'border-box',

      // Global styles
      fontFamily: 'body',
      // lineHeight: 'normal',
    },
  },
});

export default function Provider({ locale, intlMessages, theme, children }) {
  const [shadow, setShadow] = useState(null);
  const [cache, setCache] = useState(null);

  useEffect(() => {
    if (!shadow?.shadowRoot || cache) return;

    const emotionCache = createCache({
      key: 'root',
      container: shadow.shadowRoot,
    });
    setCache(emotionCache);
  }, [shadow, cache]);

  return (
    <root.div ref={setShadow}>
      {shadow?.shadowRoot && cache && (
        <UIKitProvider theme={theme} cache={cache}>
          <EnvironmentProvider value={() => shadow.shadowRoot ?? document}>
            <IntlProvider key={locale} locale={locale} messages={intlMessages}>
              {children}
            </IntlProvider>
          </EnvironmentProvider>
        </UIKitProvider>
      )}
    </root.div>
  );
}
