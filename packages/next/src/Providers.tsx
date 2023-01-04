import { SWRConfig } from 'swr';
import { UIKitProvider } from '@openagenda/uikit';
import { ApiClientProvider } from '@openagenda/react-shared';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';
import { LanguageProvider } from 'components/LanguageProvider';

type ProvidersProps = {
  locale: string;
  intlMessages: Record<string, string>;
  children: React.ReactNode;
};

const Providers = ({ locale, intlMessages, children }: ProvidersProps) => (
  <UIKitProvider>
    <ApiClientProvider>
      <LanguageProvider locale={locale} messages={intlMessages}>
        <SWRConfig
          value={{
            use: [swrStatusMiddleware],
          }}
        >
          {children}
        </SWRConfig>
      </LanguageProvider>
    </ApiClientProvider>
  </UIKitProvider>
);

export default Providers;
