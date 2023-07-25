'use strict';

const getAgendaSearchLabel = require('@openagenda/labels')(require('@openagenda/labels/agenda-search'));
const layouts = require('../../lib/layouts');

module.exports = config => (req, res, next) => {
  if (req.xhr) {
    return next();
  }

  const scripts = {
    top: [],
    bottom: [
      { src: '/js/agendaSearchIndex.js' }
    ]
  };

  const translateMode = Boolean(req.cookies.translateMode);
  const isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

  if (req.cookies.translateMode) {
    scripts.top = [
      { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
      { src: 'https://cdn.crowdin.com/jipt/jipt.js' }
    ];
  }

  if (config.matomoCloudId) {
    scripts.bottom.push({
      src: '/js/matomo.js',
      integrity: req.app.services.dynamicScripts.hashes.matomo,
    });
  }

  if (config.googleAnalyticsId) {
    scripts.bottom.push({
      body: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        ga('create', '${config.googleAnalyticsId}', 'auto');
        ga('send', 'pageview');`
    });
  }

  res.send(layouts.main(`<div class="js_search_canvas">${req.content}</div>`, {
    lang: req.lang,
    title: getAgendaSearchLabel('searchTitle', req.lang),
    scripts,
    bodyAttributes: [{
      name: 'data-options',
      value: JSON.stringify({
        lang: req.lang,
        network: req.network,
        locationSet: req.locationSet,
        canvas: '.js_search_canvas',
        agendas: req.result.agendas,
        total: req.result.total,
        res: '/agendas.json'
      })
    }],
    translateMode,
    isTranslator,
    cspNonce: res.locals.cspNonce,
  }));
};
