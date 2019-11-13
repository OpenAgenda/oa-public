import React, { useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import { LayoutManager } from '@openagenda/react-layouts/src';
import RootHelmet from '../RootHelmet';
import NotFoundDisplayer from './NotFoundDisplayer';
import NotFound from './NotFound';
import ErrorComponent from './ErrorComponent';

export default function Root({ apps, layoutStore, history, triggerHooks, req, staticContext, extractor, helmetContext }) {
  const Content = useCallback(
    () => (
      <LayoutManager store={layoutStore} history={history} apps={apps} FallbackComponent={ErrorComponent}>
        <NotFoundDisplayer history={history} apps={apps}>
          <NotFound />
        </NotFoundDisplayer>
      </LayoutManager>
    ),
    [apps, layoutStore, history]
  );

  return (
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <RootHelmet />

        {wrapApp({
          Content,
          history,
          triggerHooks,
          req,
          staticContext,
          extractor
        })}
      </HelmetProvider>
    </React.StrictMode>
  );
}
