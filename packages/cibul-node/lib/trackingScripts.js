'use strict';

function extractGoogleAnalytics(agenda) {
  const gaCode = agenda?.settings?.tracking?.googleAnalytics;

  if (!gaCode) return;

  return `ga('create', '${gaCode}', 'auto', 'clientTracker1'); ga('clientTracker1.send', 'pageview');`;
}

function GAScripts(googleAnalyticsID, agenda) {
  const scripts = [].concat(extractGoogleAnalytics(agenda) || []);

  if (googleAnalyticsID) {
    scripts.push(`
    ga('create', '${googleAnalyticsID}', 'auto');
    ga('send', 'pageview');`);
  }

  if (scripts.length) {
    scripts.splice(0, 0, `
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    `);
  }

  return scripts;
}

module.exports = ({
  matomoCloudCode,
  googleAnalyticsID,
  agenda
}) => {
  const scripts = GAScripts(googleAnalyticsID, agenda);

  if (matomoCloudCode) {
    scripts.push(matomoCloudCode);
  }

  return scripts;
};
