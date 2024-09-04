import { SWRConfig } from 'swr';
import ky from 'ky';
import { CookiesProvider, Cookies } from 'react-cookie';
import {
  UIKitProvider,
  theme as defaultTheme,
  defaultCache,
  EmotionCache,
} from '@openagenda/uikit';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';
import { LanguageProvider } from 'components/LanguageProvider';

type ProvidersProps = {
  cookies?: Cookies;
  locale: string;
  intlMessages: Record<string, string>;
  theme?: Record<string, any>;
  cache?: EmotionCache;
  children: React.ReactNode;
};

const fetcher = (input: string | URL | Request) => ky(input).json();

const Providers = ({
  locale,
  intlMessages,
  theme = defaultTheme,
  cache = defaultCache,
  cookies,
  children,
}: ProvidersProps) => (
  <CookiesProvider cookies={cookies}>
    <UIKitProvider theme={theme} cache={cache}>
      <LanguageProvider locale={locale} messages={intlMessages}>
        <SWRConfig
          value={{
            fetcher,
            use: [swrStatusMiddleware],
          }}
        >
          {children}
        </SWRConfig>
      </LanguageProvider>
    </UIKitProvider>
  </CookiesProvider>
);

export default Providers;
