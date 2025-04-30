import { SWRConfig } from 'swr';
import ky from 'ky';
import { CookiesProvider, Cookies } from 'react-cookie';
import { IntlProvider } from 'react-intl';
import {
  UIKitProvider,
  theme as defaultTheme,
  createCache,
  EmotionCache,
} from '@openagenda/uikit';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';

type ProvidersProps = {
  cookies?: Cookies;
  locale: string;
  intlMessages: Record<string, string>;
  theme?: Record<string, any>;
  cache?: EmotionCache;
  children: React.ReactNode;
};

// Key `css` is needed because of a bug with turbopack and chakra
const defaultCache = createCache({ key: 'css' });

const fetcher = (input: string | URL | Request) => ky(input).json();

const ThemeProvider = ({ cache, theme, children }) => {
  if (!theme) {
    return children;
  }

  return (
    <UIKitProvider theme={theme} cache={cache}>
      {children}
    </UIKitProvider>
  );
};

const Providers = ({
  locale,
  intlMessages,
  theme = defaultTheme,
  cache = defaultCache,
  cookies,
  children,
}: ProvidersProps) => (
  <CookiesProvider cookies={cookies}>
    <ThemeProvider theme={theme} cache={cache}>
      <IntlProvider key={locale} locale={locale} messages={intlMessages}>
        <SWRConfig
          value={{
            fetcher,
            use: [swrStatusMiddleware],
          }}
        >
          {children}
        </SWRConfig>
      </IntlProvider>
    </ThemeProvider>
  </CookiesProvider>
);

export default Providers;
