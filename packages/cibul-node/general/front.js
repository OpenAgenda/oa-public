"use strict";

const _ = require( 'lodash' );

const { callbackify } = require( 'util' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/newsletter/subscribe' ) );
const files = require( '@openagenda/files' );
const landing = require( '@openagenda/landing' );
const sessions = require( '@openagenda/sessions' );
const unsubscribedSvc = require( '@openagenda/unsubscribed' );
const log = require( '@openagenda/logs' )( 'newsletter' );
const config = require( '../config' );

const layout = require( '../services/lib/layouts' ).load( 'corpo', {
  languages: config.interfaceLanguages.filter( l => l !== 'br' )
} );

const landingPages = landing( {
  en: config.root + '/discover',
  fr: config.root + '/decouvrir',
  de: config.root + '/entdecken'
} );

const legacyPages = {
  premium: 'premium-agenda',
  basic: 'basic-agenda',
  tailored: 'a-tailored-offer',
  network: 'network-of-agendas'
};

const cmn = require( '../lib/commons-app' );
const newsletter = require( '@openagenda/newsletter' );
const mails = require( '@openagenda/mails' );
const cache = require( '@openagenda/simple-cache' )( 'landing' );
const model = require( '../services/model' );
const mwHelpers = require( '../services/lib/middlewareHelpers.js' );

const preMw = [
  cmn.loadLogger( 'general' ),
  cmn.loadBaseData( 'oa.css' )
];

module.exports = app => {

  app.get(
    [ '/', '/en', '/de', '/es', '/br' ],
    preMw,
    cmn.https,
    sessions.middleware.ifLogged( ( req, res ) => res.redirect( 302, '/home' ) ),
    _cache,
    _setLang,
    corpo
  );

  app.get(
    '/signout',
    preMw,
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    sessions.middleware.close(),
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

  app.get(
    '/emailunsubscribe',
    preMw,
    unsubscribe
  );

  app.post(
    '/emailunsubscribe',
    preMw,
    unsubscribeSubmit
  );

  app.get(
    '/start',
    preMw,
    start
  );

  app.get(
    [ '/decouvrir/:page', '/discover/:page', '/entdecken/:page' ],
    preMw,
    cmn.https,
    _corpoBrowserCache,
    _cache,
    _redirectLang,
    _redirectLegacyLinks,
    corpo
  );

  app.get(
    '/filekey/new',
    preMw,
    newFileKey
  );

}


function _cache( req, res, next ) {

  cache.get( req.url, ( err, cached ) => {

    if ( err ) return next( err );

    if ( !cached ) return next();

    res.set( 'Content-Type', 'text/html' );

    res.send( cached );

  } );

}


async function newFileKey( req, res, next ) {

  res.set( 'Content-Type', 'text/plain' );

  const prefix = await files.s3.generateUniquePrefix();

  req.log( 'generated %s', prefix );

  res.send( prefix );

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
    '/es' : 'es'
  }, req.url, null );

  if ( !req.lang ) return res.redirect( 302, '/' );

  next();

}


async function corpo( req, res, next ) {

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
  }

  const content = layout(
    page.render( stats ),
    {
      lang: page.getLang(),
      metas, // used?
      scripts: [ {
        content: `window._slaaskSettings = { key: "6b2ef2b1830ad6e1c43bbc726c8a9f98" };`
      }, {
        src: '//cdn.slaask.com/chat_loader.js'
      }, {
        src: '//code.jquery.com/jquery-2.2.4.min.js'
      }, {
        src: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'
      } ]
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

      mails( {
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


function unsubscribe( req, res ) {

  cmn.render( req, res, 'general/unsubscribe', {
    email: '',
    error: false
  } );

}

async function unsubscribeSubmit( req, res ) {
  try {
    await unsubscribedSvc( 0 ).create( {
      type: 'eventEmail',
      subject: 'email',
      identifier: req.body.email ? req.body.email : '',
    } );

    sessions.setFlash( req, res, __( 'unsubscribed', { '%email%': req.body.email }, req.lang ) );
    res.redirect( 302, '/' );
  } catch ( err ) {
    cmn.render( req, res, 'general/unsubscribe', {
      email: req.body.email ? req.body.email : '',
      error: err
    } );
  }
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
