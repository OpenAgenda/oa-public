import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient, useQueryClient } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import Layout from './Layout.js';

export default function LayoutManager({ store, apps, children, ...props }) {
  const parentQueryClient = useQueryClient();
  const queryClient = useConstant(
    () =>
      parentQueryClient
      || new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Layout apps={apps} {...props}>
          {children}
        </Layout>
      </Provider>
    </QueryClientProvider>
  );
}
