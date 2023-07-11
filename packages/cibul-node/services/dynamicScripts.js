'use strict';

const crypto = require('node:crypto');
const { dedent } = require('ts-dedent');

const cacheHeaderValue = 'public, max-age=315360000';

function hash(input) {
  return `sha256-${crypto.createHash('sha256').update(input).digest('base64')}`;
}

module.exports.init = config => {
  const scripts = {
    crisp: config.crisp ? dedent`
      window.$crisp=[];
      window.CRISP_WEBSITE_ID='${config.crisp}';
      (function(){
        d=document;
        s=d.createElement("script");
        s.src="https://client.crisp.chat/l.js";
        s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
      })();
    ` : '',
    matomo: config.matomoCloudId ? dedent`
      var _paq = window._paq = window._paq || [];
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(['disableCookies']);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://${config.matomoCloudId}/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src='https://cdn.matomo.cloud/${config.matomoCloudId}/matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    ` : '',
  };

  const hashes = {
    crisp: hash(scripts.crisp),
    matomo: hash(scripts.matomo),
  };

  return {
    hashes,
    plugApp(app) {
      app.get('/js/matomo.js', (req, res) => {
        res
          .set('Cache-control', cacheHeaderValue)
          .type('js')
          .send(scripts.matomo);
      });

      app.get('/js/crisp.js', (req, res) => {
        res
          .set('Cache-control', cacheHeaderValue)
          .type('js')
          .send(scripts.crisp);
      });
    },
  };
};
