declare const window: {
  Matomo?: any;
  matomoPluginAsyncInit?: any;
  openAgendaTracker?: any;
} & Window;

export function normalizeUrl(url: string) {
  let result = url;

  if (result.startsWith('https://')) {
    result = result.slice(8);
  }

  if (result.endsWith('/')) {
    result = result.slice(0, -1);
  }

  return result;
}

export function executeWhenMatomoReady(callback: () => void) {
  if (window.Matomo?.initialized) {
    callback();
  } else if (Array.isArray(window.matomoPluginAsyncInit)) {
    window.matomoPluginAsyncInit.push(callback);
  } else {
    window.matomoPluginAsyncInit = [callback];
  }
}

export function addMatomoTracker({ matomoUrl, matomoSiteId }) {
  const matomoDomain = normalizeUrl(matomoUrl);

  const initTracker = () => {
    try {
      const matomoTracker = window.Matomo.getTracker(
        `https://${matomoDomain}/matomo.php`,
        matomoSiteId,
      );
      matomoTracker.disableCookies();
      matomoTracker.trackPageView();
      matomoTracker.enableLinkTracking();

      window.openAgendaTracker = matomoTracker;
    } catch (err) {
      console.log('addMatomoTracker error', err);
    }
  };

  if (Array.isArray(window.matomoPluginAsyncInit)) {
    window.matomoPluginAsyncInit.unshift(initTracker);
  } else {
    window.matomoPluginAsyncInit = [initTracker];
  }

  const scriptElem = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];
  scriptElem.async = true;
  scriptElem.src = `https://${matomoDomain}/matomo.js`;
  firstScript.parentNode.insertBefore(scriptElem, firstScript);
}

export function getOpenAgendaTracker() {
  return window.openAgendaTracker || null;
}

export function addMatomoClientTracker({
  matomoUrl,
  matomoSiteId,
  matomoCustom,
}) {
  function addTracker() {
    try {
      const matomoDomain = normalizeUrl(matomoUrl);
      const matomoTracker = window.Matomo.getTracker(
        `https://${matomoDomain}/matomo.php`,
        matomoSiteId,
      );

      if (matomoCustom.length) {
        for (const instruction of matomoCustom) {
          const [fn, ...args] = instruction;
          matomoTracker[fn](...args);
        }
      } else {
        matomoTracker.trackPageView();
        matomoTracker.enableLinkTracking();
      }
    } catch (err) {
      console.log('addMatomoClientTracker error', err);
    }
  }

  executeWhenMatomoReady(addTracker);
}
