import { SWRConfig } from 'swr';
import ky from 'ky';
import { CookiesProvider, Cookies } from 'react-cookie';
import { IntlProvider } from 'react-intl';
import {
  UIKitProvider,
  system as defaultSystem,
  defaultCache,
  EmotionCache,
} from '@openagenda/uikit';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';

type ProvidersProps = {
  cookies?: Cookies;
  locale: string;
  intlMessages: Record<string, string>;
  system?: Record<string, any>;
  cache?: EmotionCache;
  children: React.ReactNode;
};

const fetcher = (input: string | URL | Request) => ky(input).json();

const SystemProvider = ({ cache, system, children }) => {
  if (!system) {
    return children;
  }

  return (
    <UIKitProvider system={system} cache={cache}>
      {children}
    </UIKitProvider>
  );
};

const Providers = ({
  locale,
  intlMessages,
  system = defaultSystem,
  cache = defaultCache,
  cookies,
  children,
}: ProvidersProps) => (
  <CookiesProvider cookies={cookies}>
    <SystemProvider system={system} cache={cache}>
      <IntlProvider key={locale} locale={locale} messages={intlMessages}>
        <DateFnsLocaleProvider>
          <SWRConfig
            value={{
              fetcher,
              use: [swrStatusMiddleware],
            }}
          >
            {children}
          </SWRConfig>
        </DateFnsLocaleProvider>
      </IntlProvider>
    </SystemProvider>
  </CookiesProvider>
);

export default Providers;
