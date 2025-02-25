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
  } else {
    if (Array.isArray(window.matomoPluginAsyncInit)) {
      window.matomoPluginAsyncInit.push(addTracker);
    } else {
      window.matomoPluginAsyncInit = [
        addTracker,
      ];
    }
  }
}
