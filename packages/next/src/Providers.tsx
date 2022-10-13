import { UIKitProvider } from '@openagenda/uikit';
import { SWRConfig } from 'swr';
import swrStatusMiddleware from 'utils/swrStatusMiddleware';

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => (
  <UIKitProvider>
    <SWRConfig
      value={{
        use: [swrStatusMiddleware],
      }}
    >
      {children}
    </SWRConfig>
  </UIKitProvider>
);

export default Providers;
