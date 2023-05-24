import React, { useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from 'react-query';
import { wrapApp } from '@openagenda/react-shared';
import { LayoutManager } from '@openagenda/react-layouts';
import NotFoundDisplayer from './NotFoundDisplayer';
import NotFound from './NotFound';
import ErrorComponent from './ErrorComponent';

export default function Root({
  apps,
  layoutStore,
  history,
  triggerHooks,
  req,
  staticContext,
  extractor,
  helmetContext,
  queryClient,
  children,
}) {
  const Content = useCallback(
    () => (
      <LayoutManager
        store={layoutStore}
        apps={apps}
        fallback={ErrorComponent}
      >
        <NotFoundDisplayer history={history} apps={apps}>
          <NotFound />
        </NotFoundDisplayer>
      </LayoutManager>
    ),
    [apps, layoutStore, history]
  );

  return (
    // <React.StrictMode>
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        {children}

        {wrapApp({
          Content,
          history,
          triggerHooks,
          req,
          staticContext,
          extractor,
        })}
      </QueryClientProvider>
    </HelmetProvider>
    // </React.StrictMode>
  );
}
