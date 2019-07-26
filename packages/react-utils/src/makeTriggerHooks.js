import { trigger } from 'redial';
import asyncMatchRoutes from './asyncMatchRoutes';

function haveHooks( hooks, components ) {
  return hooks.some( hook => components.some( v => v[ '@@redial-hooks' ] && v[ '@@redial-hooks' ][ hook ] ) );
}

export default function makeTriggerHooks( { routes, history, helpers, req } ) {
  return async ( { pathname, hooks = [ 'inject', 'fetch', 'defer' ], onStart, onFinish } = {} ) => {
    let notFound = null;
    let isStarted = false;
    let isFinished = false;

    // Avoid synchronous onStart -> onFinish
    const start = () => setTimeout( () => {
      if ( !isStarted && !isFinished ) {
        isStarted = true;
        onStart();
      }
    } );

    const { components, match, params } = await asyncMatchRoutes(
      routes,
      pathname || (req ? req.originalUrl : history.location.pathname),
      {
        skipPreload: comps => {
          notFound = comps.length;

          if (
            typeof onStart === 'function'
            && !notFound // is found
            && comps.some( v => v.preload ) // at least one have preload fn
            && !comps // not already loaded
              .filter( v => v.preload )
              .every( v => (typeof v.isReady === 'function' && v.isReady()) )
          ) {
            start();
          }

          return notFound;
        }
      }
    );

    const compsHaveHooks = haveHooks( hooks, components );

    if ( !notFound && !isStarted && typeof onStart === 'function' && compsHaveHooks ) {
      start();
    }

    const triggerLocals = {
      ...helpers,
      match,
      params
    };

    if ( hooks.includes( 'inject' ) ) {
      await trigger( 'inject', components, triggerLocals );
    }

    // Don't fetch data for initial route, server has already done the work:
    if ( typeof window !== 'undefined' && window.__PRELOADED__ ) {
      // Delete initial data so that subsequent data fetches can occur:
      delete window.__PRELOADED__;
    } else if ( hooks.includes( 'fetch' ) ) {
      // Fetch mandatory data dependencies for 2nd route change onwards:
      await trigger( 'fetch', components, triggerLocals );
    }

    if ( typeof window !== 'undefined' && hooks.includes( 'defer' ) ) {
      await trigger( 'defer', components, triggerLocals );
    }

    isFinished = true;

    if ( isStarted && typeof onFinish === 'function' ) {
      setTimeout( () => {
        onFinish();
      } );
    }
  };
}
