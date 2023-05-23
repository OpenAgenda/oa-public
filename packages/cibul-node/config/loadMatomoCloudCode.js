'use strict';

module.exports = function loadMatomoCloudCode(matomoCloudId) {
  if (!matomoCloudId) {
    return;
  }
  return `
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['disableCookies']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://${matomoCloudId}/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src='//cdn.matomo.cloud/${matomoCloudId}/matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  `;
};
