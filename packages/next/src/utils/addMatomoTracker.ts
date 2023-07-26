declare global {
  interface Window {
    Matomo?: any
    matomoPluginAsyncInit?: any
  }
}

function normalizeUrl(url) {
  let result = url;

  if (result.startsWith('https://')) {
    result = result.slice(8);
  }

  if (result.endsWith('/')) {
    result = result.slice(0, -1);
  }

  return result;
}

export function addMatomoTracker({
  matomoUrl,
  matomoSiteId,
}) {
  const matomoDomain = normalizeUrl(matomoUrl);

  window.matomoPluginAsyncInit = [
    () => {
      try {
        const matomoTracker = window.Matomo.getTracker(`https://${matomoDomain}/matomo.php`, matomoSiteId);
        matomoTracker.disableCookies();
        matomoTracker.trackPageView();
        matomoTracker.enableLinkTracking();
      } catch (err) {
        console.log('addMatomoTracker error', err);
      }
    },
  ];

  const scriptElem = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];
  scriptElem.async = true;
  scriptElem.src = `https://cdn.matomo.cloud/${matomoDomain}/matomo.js`;
  firstScript.parentNode.insertBefore(scriptElem, firstScript);
}

export function addMatomoClientTracker({
  matomoUrl,
  matomoSiteId,
  matomoCustom,
}) {
  function addTracker() {
    try {
      const matomoDomain = normalizeUrl(matomoUrl);
      const matomoTracker = window.Matomo.getTracker(`https://${matomoDomain}/matomo.php`, matomoSiteId);

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

  if (window.Matomo?.initialized) {
    addTracker();
  } else if (Array.isArray(window.matomoPluginAsyncInit)) {
    window.matomoPluginAsyncInit.push(addTracker);
  } else {
    window.matomoPluginAsyncInit = [
      addTracker,
    ];
  }
}
