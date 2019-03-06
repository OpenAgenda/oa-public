import { trigger } from 'redial';
import asyncMatchRoutes from './asyncMatchRoutes';

export default function makeTriggerHooks( { routes, history, helpers, req } ) {
  return async ( { onStart, onFinish } = {} ) => {
    let notFound = null;
    let isStarted = false;
    let isFinished = false;

    // Avoid synchronous onStart -> onFinish
    const start = () => setTimeout( () => {
      if ( !isFinished ) {
        onStart();
      }
    } );

    const { components, match, params } = await asyncMatchRoutes(
      routes,
      req ? req.originalUrl : history.location.pathname,
      {
        skipPreload: comps => {
          notFound = comps.some( v => (v && v.isNotFound) );

          if (
            typeof onStart === 'function'
            && !notFound // is found
            && comps.some( v => v.preload ) // at least one have preload fn
            && !comps // not already loaded
              .filter( v => v.preload )
              .every( v => (typeof v.isReady === 'function' && v.isReady()) )
          ) {
            isStarted = true;
            start();
          }

          return notFound;
        }
      }
    );

    if (
      typeof onStart === 'function'
      && components.some( v => v[ '@@redial-hooks' ] )
    ) {
      isStarted = true;
      start();
    }

    const triggerLocals = {
      ...helpers,
      match,
      params
    };

    // Don't fetch data for initial route, server has already done the work:
    if ( typeof window !== 'undefined' && window.__PRELOADED__ ) {
      // Delete initial data so that subsequent data fetches can occur:
      delete window.__PRELOADED__;
    } else {
      // Fetch mandatory data dependencies for 2nd route change onwards:
      await trigger( 'fetch', components, triggerLocals );
    }

    if ( typeof window !== 'undefined' ) {
      await trigger( 'defer', components, triggerLocals );
    }

    isFinished = true;

    if (
      isStarted
      && typeof onFinish === 'function'
      && components.some( v => v[ '@@redial-hooks' ] )
    ) {
      setTimeout( () => onFinish() );
    }
  };
}
