import { SWRConfig } from 'swr';
import { CookiesProvider, Cookies } from 'react-cookie';
import { UIKitProvider } from '@openagenda/uikit';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';
import { LanguageProvider } from 'components/LanguageProvider';

type ProvidersProps = {
  cookies?: Cookies;
  locale: string;
  intlMessages: Record<string, string>;
  children: React.ReactNode;
};

const Providers = ({ locale, intlMessages, cookies, children }: ProvidersProps) => (
  <CookiesProvider cookies={cookies}>
    <UIKitProvider>
      <LanguageProvider locale={locale} messages={intlMessages}>
        <SWRConfig
          value={{
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
