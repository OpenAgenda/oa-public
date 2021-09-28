import { trigger } from 'redial';
import asyncMatchRoutes from './asyncMatchRoutes';

function haveHooks(hooks, components) {
  return hooks.some(hook => components.some(v => v['@@redial-hooks'] && v['@@redial-hooks'][hook]));
}

export default function makeTriggerHooks({ routes, history, helpers, req }) {
  return async ({ pathname, hooks = ['inject', 'fetch', 'defer'], onStart, onFinish } = {}) => {
    let notFound = null;
    let isStarted = false;
    let isFinished = false;

    // Avoid synchronous onStart -> onFinish
    const start = () => setTimeout(() => {
      if (!isStarted && !isFinished) {
        isStarted = true;
        onStart();
      }
    });

    const { components, match, params } = await asyncMatchRoutes(
      routes,
      pathname || (req ? req.originalUrl : history.location.pathname),
      {
        skipPreload: result => {
          const { components: comps } = result;

          notFound = !result.match.some(v => v.route.component && !v.route.routes);

          if (
            typeof onStart === 'function'
            && !notFound // is found
            && comps.some(v => v.load) // at least one have load fn
            && !comps // not already loaded
              .filter(v => v.load)
              .every(v => (typeof v.isReady === 'function' && v.isReady()))
          ) {
            start();
          }

          return notFound;
        }
      }
    );

    const compsHaveHooks = haveHooks(hooks, components);

    if (!notFound && !isStarted && typeof onStart === 'function' && compsHaveHooks) {
      start();
    }

    Object.assign(helpers, { match, params });

    if (hooks.includes('inject')) {
      await trigger('inject', components, helpers);
    }

    // Don't fetch data for initial route, server has already done the work:
    if (typeof window !== 'undefined' && window.__PRELOADED__) {
      // Delete initial data so that subsequent data fetches can occur:
      delete window.__PRELOADED__;
    } else if (hooks.includes('fetch')) {
      // Fetch mandatory data dependencies for 2nd route change onwards:
      await trigger('fetch', components, helpers);
    }

    if (typeof window !== 'undefined' && hooks.includes('defer')) {
      await trigger('defer', components, helpers);
    }

    isFinished = true;

    if (isStarted && typeof onFinish === 'function') {
      setTimeout(() => {
        onFinish();
      });
    }
  };
}
