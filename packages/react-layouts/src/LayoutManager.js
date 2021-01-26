import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useConstant, ApiClientContext, apiClient } from '@openagenda/react-shared';

import Layout from './Layout';

export default function LayoutManager({
  store, apps, children, ...props
}) {
  const client = useConstant(() => apiClient('', null));

  const queryClient = useConstant(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <ApiClientContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Layout apps={apps} {...props}>
            {children}
          </Layout>
        </Provider>
      </QueryClientProvider>
    </ApiClientContext.Provider>
  );
}
