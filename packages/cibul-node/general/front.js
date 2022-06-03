"use strict";

const _ = require( 'lodash' );

const { callbackify } = require( 'util' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/newsletter/subscribe' ) );
const landing = require( '@openagenda/landing' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'newsletter' );
const config = require( '../config' );

const layout = require( '../services/lib/layouts' ).load( 'corpo', {
  languages: config.interfaceLanguages
} );

const landingPages = landing( {
  en: config.root + '/discover',
  fr: config.root + '/decouvrir',
  de: config.root + '/entdecken',
  br: config.root + '/decouvrirbr',
  es: config.root + '/descubrir',
  it: config.root + '/scoprire'
} );

const legacyPages = {
  premium: 'premium-agenda',
  basic: 'basic-agenda',
  tailored: 'a-tailored-offer',
  network: 'network-of-agendas'
};

const cmn = require( '../lib/commons-app' );
const newsletter = require( '@openagenda/newsletter' );
const mails = require( '../services/mails' );
const mwHelpers = require( '../services/lib/middlewareHelpers.js' );

const preMw = [
  cmn.loadLogger( 'general' ),
  cmn.loadBaseData( 'oa-main.css' ),
];

module.exports = app => {
  const cache = app.services.simpleCache('landing');
  const cacheMw = (req, res, next) => {
    cache.get(req.url, (err, cached) => {
      if (err) return next(err);

      if (!cached) return next();

      res.set('Content-Type', 'text/html');
      res.send(cached);
    });
  };

  app.get(
    [ '/', '/en', '/de', '/es', '/br', '/it' ],
    preMw,
    cmn.https,
    sessions.mw.ifLogged( ( req, res ) => res.redirect( 302, '/home' ) ),
    cacheMw,
    _setLang,
    corpo.bind(null, cache)
  );

  app.get(
    '/signout',
    preMw,
    sessions.mw.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    sessions.mw.close(),
    ( req, res ) => res.redirect( 302, '/' )
  );

  app.post(
    '/newsletter/subscribe',
    preMw,
    newsletterSubscribe
  );

  app.get(
    '/services/:service/connect/callback',
    preMw,
    serviceConnectCallback
  );

  app.get('/flash', (req, res, next) => {
    req.app.services.sessions.setFlash(req, res, req.query.message || 'Flash! Aaanhaaan!');
    res.redirect('/');
  });

  app.get(
    '/start',
    preMw,
    start
  );

  app.get(
    ['/decouvrir/:page', '/discover/:page', '/entdecken/:page', '/scoprire/:page', 'descubrir/:page', '/decouvrirbr/:page'],
    preMw,
    cmn.https,
    _corpoBrowserCache,
    cacheMw,
    _redirectLang,
    _redirectLegacyLinks,
    corpo.bind(null, cache)
  );

}


function _corpoBrowserCache( req, res, next ) {

  mwHelpers.compareModifiedSince( config.corpoLastUpdate, req, res, next );

}


function _setLang( req, res, next ) {

  if ( req.query.lang ) return res.redirect( 301, '/' + req.query.lang );

  req.lang = _.get( {
    '/' : 'fr',
    '/en' : 'en',
    '/de' : 'de',
    '/es' : 'es',
    '/br' : 'br',
    '/it' : 'it'
  }, req.url, null );

  if ( !req.lang ) return res.redirect( 302, '/' );

  next();

}


async function corpo(cache, req, res, next) {

  const pageName = req.params.page || req.url.substr( 1 );

  let page = landingPages( pageName );

  if ( !page ) {

    req.log( 'error', 'unknown page %s', pageName );

    return res.redirect( `/${req.lang}` );

  }

  if ( req.query.lang && page.getLang() !== req.query.lang) {

    return res.redirect( page.getAlternateUrl( req.lang ) );

  }

  const metas = page.getHeadPart();

  const stats = {
    agendas: await _getStat( 'review' ),
    contributors: await _getStat( 'reviewer' ),
    events: await _getStat( 'event' )
  };

  const pageScripts = [];

  if ((config.crisp || '').length) {
    pageScripts.push({
      content: `window.$crisp=[];
        window.CRISP_WEBSITE_ID='${config.crisp}';
        (function(){
          d=document;
          s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";
          s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
        })();`
    });
  }

  if (config.matomoCloudCode) {
    pageScripts.push({ content: config.matomoCloudCode });
  }

  [
    '//code.jquery.com/jquery-2.2.4.min.js',
    '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
    '/js/landing.js'
  ].forEach(src => pageScripts.push({ src }));

  const content = layout(
    page.render(stats),
    {
      lang: page.getLang(),
      metas, // used?
      scripts: pageScripts
    }
  );

  cache.set( req.url, content, 60*60, err => {

    if ( err ) req.log( 'error', 'could not cache %s', err );

  } );

  res.send( content );

  req.log( 'info', {
    landing: page.getAlternateUrl( 'fr' ).split( '/' ).pop(),
    lang: req.lang,
    message: 'discover page: ' + req.params.page,
    userAgent: req.headers[ 'user-agent' ]
  } );

}

function _getStat( schema, lang ) {

  return config.knex( schema )
    .count( 'id as items' )
    .then( r => _.get( r, '0.items' ).toLocaleString( lang ).replace( ',', lang === 'fr' ? ' ' : ',' ) );

}


function newsletterSubscribe( req, res ) {

  callbackify( newsletter.addSubscriber )( req.body.email, err => {

    if ( err ) {

      log( 'error', { service: 'newsletter', message: err.message, error: err } );

      sessions.setFlash( req, res, __( 'invalidEmail', req.lang ) );

      res.redirect( 302, '/' );

    } else {

      log( 'info', 'Nouvel inscrit à la newsletter: %s', req.body.email, { email: req.body.email } );

      sessions.setFlash( req, res, __( 'subscribed', req.lang ) );

      res.redirect( 302, '/' );

      mails.send( {
        to: 'admin@openagenda.com',
        subject: 'Nouvel inscrit à la newsletter',
        text: `"${req.body.email}" a été ajouté à la newsletter.`
      } );

    }

  } );

}


function _redirectLang( req, res, next ) {

  if ( req.query && req.query.lang && config.interfaceLanguages.indexOf( req.query.lang ) === -1 ) {

    return res.redirect( 301, `/discover/${req.params.page}?lang=en` );

  }

  next();

}


function _redirectLegacyLinks( req, res, next ) {

  if ( legacyPages[ req.params.page ] ) {

    return res.redirect( 301, `/discover/${legacyPages[ req.params.page ]}?lang=${req.lang}` );

  }

  next();

}


function start( req, res, next ) {

  const actions = {
    header_signin: '/signin?lang=' + req.lang,
    header_signup: '/signup?lang=' + req.lang,
    header_phone: 'ok',
    main: '/signup?lang=' + req.lang,
    pricing_free: '/signup?lang=' + req.lang,
    pricing_custom: config.contactResource,
    pricing_premium: config.contactResource,
    pricing_tailored: config.contactResource,
    bottom: '/signup?lang=' + req.lang,
    newsletter: '/home'
  }

  let action = Object.keys( actions ).filter( v => req.query.a === v );

  if ( !action.length ) {

    return res.redirect( 301, '/' );

  }

  action = action[ 0 ];

  req.log( 'info', {
    message: 'corpo link: ' + action,
    action: action,
    userAgent: req.headers[ 'user-agent' ]
  } );

  if ( actions[ action ] === 'ok' ) {

    return res.send( 'ok' );

  }

  res.redirect( 301, actions[ action ] );

}

function serviceConnectCallback( req, res ) {

  let stateObj;

  try {

    stateObj = JSON.parse( Buffer.from( req.query.state, 'base64' ).toString() );

  } catch ( e ) {

    return cmn.catchError( req, res )( { code: 500, message: 'invalid parameters' } );

  }

  res.redirect( 302, req.genUrl( 'serviceSynchronize', {
    slug: stateObj.slug,
    service: req.params.service,
    code: req.query.code
  } ) );

}
