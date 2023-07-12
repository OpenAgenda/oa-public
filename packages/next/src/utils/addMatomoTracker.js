/* eslint-disable */

export default function addMatomoTracker({ matomoUrl, matomoSiteId, matomoCustom = null }) {
  if (matomoCustom) {
    console.log('addMatomoCustomTracker');
    const custom = new Function(matomoCustom);
    custom();
    return; 
  }
  console.log('addMatomoDefaultTracker');
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u=`${matomoUrl}`;
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', matomoSiteId]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=`//cdn.matomo.cloud/${matomoUrl}matomo.js`; s.parentNode.insertBefore(g,s);
  })();
}