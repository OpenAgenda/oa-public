'use strict';

const { callbackify } = require('node:util');
const _ = require('lodash');


const __ = require('@openagenda/labels')(require('@openagenda/labels/newsletter/subscribe'));
const landing = require('@openagenda/landing');
const sessions = require('@openagenda/sessions');
const log = require('@openagenda/logs')('newsletter');
const newsletter = require('@openagenda/newsletter');
const getAssetsManifest = require('../lib/getAssetsManifest');
const config = require('../config');

const layout = require('../services/lib/layouts').load('corpo', {
  languages: config.interfaceLanguages,
});

const landingPages = landing({
  en: `${config.root}/discover`,
  fr: `${config.root}/decouvrir`,
  de: `${config.root}/entdecken`,
  br: `${config.root}/decouvrirbr`,
  es: `${config.root}/descubrir`,
  it: `${config.root}/scoprire`,
  oc: `${config.root}/decouvriroc`,
});

const legacyPages = {
  premium: 'premium-agenda',
  basic: 'basic-agenda',
  tailored: 'a-tailored-offer',
  network: 'network-of-agendas',
};

const mails = require('../services/mails');
const cmn = require('../lib/commons-app');
const mwHelpers = require('../services/lib/middlewareHelpers');
const contentSecurityPolicy = require('../lib/contentSecurityPolicy');

function setLang(req, res, next) {
  if (req.query.lang) return res.redirect(301, `/${req.query.lang}`);

  req.lang = _.get({
    '/': 'fr',
    '/en': 'en',
    '/de': 'de',
    '/es': 'es',
    '/br': 'br',
    '/it': 'it',
    '/oc': 'oc',
  }, req.originalUrl, null);

  if (!req.lang) return res.redirect(302, '/');

  next();
}

function setCSPHeader(hashes, req, res) {
  let cspError;
  contentSecurityPolicy({
    ...contentSecurityPolicy.defaultDirectives,
    fontSrc: [
      ...contentSecurityPolicy.defaultDirectives.fontSrc,
      'https://client.crisp.chat',
    ],
    styleSrc: [
      ...contentSecurityPolicy.defaultDirectives.styleSrc,
      'https://client.crisp.chat',
    ],
    scriptSrc: [
      ...contentSecurityPolicy.defaultDirectives.scriptSrc,
      ...hashes,
    ],
    connectSrc: [
      ...contentSecurityPolicy.defaultDirectives.connectSrc,
      'wss://client.relay.crisp.chat',
    ],
  })(req, res, err => {
    cspError = err;
  });
  return cspError;
}

const preMw = [
  cmn.loadLogger('general'),
  cmn.loadBaseData('oa-main.css'),
];

function getStat(schema, lang) {
  return config.knex(schema)
    .count('id as items')
    .then(r => _.get(r, '0.items').toLocaleString(lang).replace(',', lang === 'fr' ? ' ' : ','));
}

async function corpo(cache, req, res, next) {
  console.log(req);
  const pageName = req.params.page || req.originalUrl.substr(1);
  console.log('pageName', pageName);
  const page = landingPages(pageName);

  if (!page) {
    req.log.error('unknown page %s', pageName);

    return res.redirect(`/${req.lang}`);
  }

  if (req.query.lang && page.getLang() !== req.query.lang) {
    return res.redirect(page.getAlternateUrl(req.lang));
  }

  const { dynamicScripts } = req.app.services;

  const stats = {
    agendas: await getStat('review'),
    contributors: await getStat('reviewer'),
    events: await getStat('event'),
  };

  const pageScripts = [];

  if ((config.crisp || '').length) {
    pageScripts.push({
      src: '/js/crisp.js',
      integrity: dynamicScripts.hashes.crisp,
    });
  }

  if (config.matomoCloudId) {
    pageScripts.push({
      src: '/js/matomo.js',
      integrity: dynamicScripts.hashes.matomo,
    });
  }

  const assetsManifest = await getAssetsManifest();

  pageScripts.push(
    {
      src: 'https://code.jquery.com/jquery-2.2.4.min.js',
      integrity: 'sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=',
      crossorigin: '',
    },
    {
      src: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
      integrity: 'sha256-U5ZEeKfGNOja007MMD3YBI0A3OSZOQbeG6z2f2Y0hu8=',
      crossorigin: '',
    },
    assetsManifest['landing.js'],
  );

  const scriptCSPHashes = pageScripts.map(s => `'${s.integrity}'`);

  const cspError = setCSPHeader(scriptCSPHashes, req, res);
  if (cspError) return next(cspError);

  const content = layout(
    page.render(stats),
    {
      lang: page.getLang(),
      metas: page.getHeadPart(),
      scripts: pageScripts,
      // cspNonce: res.locals.cspNonce,
    },
  );

  cache.set(req.originalUrl, { content, scriptCSPHashes }, 60 * 60, err => {
    if (err) req.log.error('could not cache %s', err);
  });

  res.send(content);

  req.log.info({
    landing: page.getAlternateUrl('fr').split('/').pop(),
    lang: req.lang,
    message: `discover page: ${req.params.page}`,
    userAgent: req.headers['user-agent'],
  });
}

function newsletterSubscribe(req, res) {
  callbackify(newsletter.addSubscriber)(req.body.email, err => {
    if (err) {
      log('error', { service: 'newsletter', message: err.message, error: err });

      sessions.setFlash(req, res, __('invalidEmail', req.lang));

      res.redirect(302, '/');
    } else {
      log('info', 'Nouvel inscrit à la newsletter: %s', req.body.email, { email: req.body.email });

      sessions.setFlash(req, res, __('subscribed', req.lang));

      res.redirect(302, '/');

      mails.send({
        to: 'admin@openagenda.com',
        subject: 'Nouvel inscrit à la newsletter',
        text: `"${req.body.email}" a été ajouté à la newsletter.`,
      });
    }
  });
}

function serviceConnectCallback(req, res) {
  let stateObj;

  try {
    stateObj = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
  } catch (e) {
    return cmn.catchError(req, res)({ code: 500, message: 'invalid parameters' });
  }

  res.redirect(302, req.genUrl('serviceSynchronize', {
    slug: stateObj.slug,
    service: req.params.service,
    code: req.query.code,
  }));
}

function start(req, res) {
  const actions = {
    header_signin: `/signin?lang=${req.lang}`,
    header_signup: `/signup?lang=${req.lang}`,
    header_phone: 'ok',
    main: `/signup?lang=${req.lang}`,
    pricing_free: `/signup?lang=${req.lang}`,
    pricing_custom: config.contactResource,
    pricing_premium: config.contactResource,
    pricing_tailored: config.contactResource,
    bottom: `/signup?lang=${req.lang}`,
    newsletter: '/home',
  };

  let action = Object.keys(actions).filter(v => req.query.a === v);

  if (!action.length) {
    return res.redirect(301, '/');
  }

  [action] = action;

  req.log.info({
    message: `corpo link: ${action}`,
    action,
    userAgent: req.headers['user-agent'],
  });

  if (actions[action] === 'ok') {
    return res.send('ok');
  }

  res.redirect(301, actions[action]);
}

function corpoBrowserCache(req, res, next) {
  mwHelpers.compareModifiedSince(config.corpoLastUpdate, req, res, next);
}

function redirectLang(req, res, next) {
  if (req.query && req.query.lang && config.interfaceLanguages.indexOf(req.query.lang) === -1) {
    return res.redirect(301, `/discover/${req.params.page}?lang=en`);
  }

  next();
}

function redirectLegacyLinks(req, res, next) {
  if (legacyPages[req.params.page]) {
    return res.redirect(301, `/discover/${legacyPages[req.params.page]}?lang=${req.lang}`);
  }

  next();
}

module.exports = app => {
  const cache = app.services.simpleCache('landing');
  const cacheMw = (req, res, next) => {
    cache.get(req.originalUrl, (err, cached) => {
      if (err) return next(err);

      if (!cached) return next();

      const { content, scriptCSPHashes } = JSON.parse(cached);

      const cspError = setCSPHeader(scriptCSPHashes, req, res);
      if (cspError) return next(cspError);

      res.set('Content-Type', 'text/html');
      res.send(content);
    });
  };

  app.get(
    ['/', '/en', '/de', '/es', '/br', '/it', '/oc'],
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    // cacheMw,
    setLang,
    corpo.bind(null, cache),
  );

  app.get(
    '/signout',
    preMw,
    sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    sessions.mw.close(),
    (req, res) => res.redirect(302, '/'),
  );

  app.post(
    '/newsletter/subscribe',
    preMw,
    newsletterSubscribe,
  );

  app.get(
    '/services/:service/connect/callback',
    preMw,
    serviceConnectCallback,
  );

  app.get('/flash', (req, res) => {
    req.app.services.sessions.setFlash(req, res, req.query.message || 'Flash! Aaanhaaan!');
    res.redirect('/');
  });

  app.get(
    '/start',
    preMw,
    start,
  );

  app.get(
    ['/decouvrir/:page', '/discover/:page', '/entdecken/:page', '/scoprire/:page', 'descubrir/:page', '/decouvrirbr/:page', 'decouvriroc/:page'],
    preMw,
    corpoBrowserCache,
    // cacheMw,
    redirectLang,
    redirectLegacyLinks,
    corpo.bind(null, cache),
  );

  app.get('/events', (req, res) => res.redirect(302, '/agendas'));
};
