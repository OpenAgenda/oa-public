function addV4Tracker(googleAnalyticsID) {
  const previousScript = document.getElementsByTagName('script')[0];
  const el = document.createElement('script');
  el.async = true;
  el.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsID}`;

  previousScript.parentNode.insertBefore(el, previousScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  gtag('consent', 'default', {
    ad_storage: 'granted',
    analytics_storage: 'granted',
  });
  gtag('js', new Date());
  gtag('config', googleAnalyticsID);
}

export default function addGoogleAnalyticsTracker({ googleAnalyticsID }) {
  if (!googleAnalyticsID) {
    return;
  }

  if (googleAnalyticsID.substring(0, 1) === 'G') {
    return addV4Tracker(googleAnalyticsID);
  }

  /* eslint-disable */
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    (i[r] =
      i[r] ||
      function () {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date().getTime());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga',
  );
  /* eslint-enable */

  window.ga('create', googleAnalyticsID, 'auto');
  window.ga('send', 'pageview');
}
