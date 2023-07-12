/* eslint-disable */

export default function addMatomoTracker({ matomoUrl, matomoSiteId, matomoCustom = null }) {
  console.log('addMatomoTracker');
  if (matomoCustom) {
    const custom = new Function(matomoCustom);
    custom();
    return; 
  }
  
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  console.log('after _paq.push([\'trackPageView\']);');
  _paq.push(['enableLinkTracking']);
  (function() {
    var u=`${matomoUrl}`;
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', matomoSiteId]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='//cdn.matomo.cloud/dopenagenda.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
  })();
}