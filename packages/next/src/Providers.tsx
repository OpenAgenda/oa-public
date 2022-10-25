import { SWRConfig } from 'swr';
import { UIKitProvider } from '@openagenda/uikit';
import { ApiClientProvider } from '@openagenda/react-shared';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';
import { LanguageProvider } from 'components/LanguageProvider';

type ProvidersProps = {
  intlMessages: any;
  children: React.ReactNode;
};

const Providers = ({ intlMessages, children }: ProvidersProps) => (
  <UIKitProvider>
    <ApiClientProvider>
      <LanguageProvider messages={intlMessages}>
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
