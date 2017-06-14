"use strict";

const landing = require( 'landing' ),

  sessions = require( 'sessions' ),

  config = require( '../config' ),

  __ = require( 'labels' )( require( 'labels/newsletter/subscribe' ) ),

  landingPages = landing( {
    en: config.root + '/discover',
    fr: config.root + '/decouvrir'
  } ),

  legacyPages = {
    premium: 'premium-agenda',
    basic: 'basic-agenda',
    tailored: 'a-tailored-offer',
    network: 'network-of-agendas'
  },

  coms = require( '../lib/coms' ),

  w = require( 'when' ),

  cmn = require( '../lib/commons-app' ),

  newsletter = require( 'newsletter' ),

  mailer = require( 'mailer' ),

  modLib = require( '../lib/moduleLib' ),

  cache = require( 'simple-cache' )( 'landing' ),

  model = require( '../services/model' ),

  metaLabels = require( 'labels' )( require( 'labels/corpo/metas' ) ),

  mwHelpers = require( '../services/lib/middlewareHelpers.js' ),

  _homeMw = [
    cmn.https,
    _corpoBrowserCache,
    _cache,
    cmn.loadBaseData( 'oasfmain.css' ),
    sessions.middleware.ifLogged( cmn.redirectTo( 'homeShow' ) ),
    _setLang,
    _counters,
    corpo
  ],

  routes = {
    corpoHome: [ 'get', '/', _homeMw ],
    corpoHomeEn: [ 'get', '/en', _homeMw ],
    signout: [ 'get', '/signout', [
      sessions.middleware.ifUnlogged( cmn.redirectTo() ),
      sessions.middleware.close(),
      cmn.redirectTo()
    ] ],
    newsletterSubscribe: [ 'post', '/newsletter/subscribe', newsletterSubscribe ],
    serviceConnectCallback: [ 'get', '/services/:service/connect/callback', serviceConnectCallback ],
    emailUnsubscribe: [ 'get', '/emailunsubscribe', unsubscribe ],
    emailUnsubscribeSubmit: [ 'post', '/emailunsubscribe', unsubscribeSubmit ],
    start: [ 'get', '/start', start ],
    decouvrir: [ 'get', '/decouvrir/:page', [
      cmn.https,
      _corpoBrowserCache,
      _cache,
      cmn.loadBaseData( 'oasfmain.css' ),
      _redirectLang,
      _redirectLegacyLinks,
      corpo 
    ] ],
    discover: [ 'get', '/discover/:page', [ 
      cmn.https,
      _corpoBrowserCache,
      _cache,
      cmn.loadBaseData( 'oasfmain.css' ),
      _redirectLang,
      _redirectLegacyLinks,
      corpo 
    ] ],
  };

module.exports = path => {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'general' ),
    cmn.loadBaseData( 'oa.css' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function _cache( req, res, next ) {

  cache.get( req.url, ( err, cached ) => {

    if ( err ) return next( err );

    if ( !cached ) return next();

    res.set( 'Content-Type', 'text/html' );

    res.send( cached );

  } );

}


function _corpoBrowserCache( req, res, next ) {

  mwHelpers.compareModifiedSince( config.corpoLastUpdate, req, res, next );

}

function _counters( req, res, next ) {

  getStats().then( stats => {

    req.stats = {
      agendas: stats[ 0 ].toLocaleString( req.lang ).replace( ',', req.lang === 'fr' ? ' ' : ',' ),
      contributors: stats[ 1 ].toLocaleString( req.lang ).replace( ',', req.lang === 'fr' ? ' ' : ',' ),
      events: stats[ 2 ].toLocaleString( req.lang ).replace( ',', req.lang === 'fr' ? ' ' : ',' )
    }

    next();

  } );

}


function _setLang( req, res, next ) {

  req.lang = req.url === '/' ? 'fr' : 'en';

  next();

}


function corpo( req, res, next ) {

  const pageName = req.params.page || ( req.lang === 'fr' ? '' : 'en' );

  let page = landingPages( pageName );

  if ( !page ) {

    req.log( 'error', 'unknown page %s', pageName );

    return res.redirect( req.genUrl( 'corpoHome', { lang: req.lang } ) );

  }

  if ( req.query.lang && page.getLang() !== req.query.lang) {

    return res.redirect( page.getAlternateUrl( req.lang ) );

  }

  cmn.renderTemplate( req, 'corpo/empty', {}, ( err, layout ) => {

    let content = layout.replace( '<!--content-->', page.render( req.stats ) );

    content = content.replace( '<!--metas-->', page.getHeadPart() );

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

  } );

}


async function getStats() {

  return [
    await getTotalAgendas(),
    await getTotalContributors(),
    await getTotalEvents()
  ]

}


function getTotalAgendas() {

  return new Promise( ( resolve, reject ) => {

    model.lib.query( 'SELECT COUNT(*) AS reviews FROM review', function ( err, rows ) {
      
      if ( err ) return reject( err );

      resolve( rows[ 0 ].reviews );

    } );

  } );

}

function getTotalContributors() {

  return new Promise( ( resolve, reject ) => {

    model.lib.query( 'SELECT COUNT(*) AS reviewers FROM reviewer', function ( err, rows ) {

      if ( err ) return reject( err );
      resolve( rows[ 0 ].reviewers );

    } );

  } );

}

function getTotalEvents() {

  return new Promise( ( resolve, reject ) => {

    model.lib.query( 'SELECT COUNT(*) AS events FROM event', function ( err, rows ) {

      if ( err ) return reject( err );

      resolve( rows[ 0 ].events );

    } );

  } );

}


function newsletterSubscribe( req, res ) {

  newsletter.addSubscriber( req.body.email, ( err, result ) => {

    if ( err ) {

      req.log( 'error', { service: 'newsletter', message: result.message, error: result.message } );

      sessions.setFlash( req, res, __( 'invalidEmail', req.lang ) );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

    } else {

      sessions.setFlash( req, res, __( 'subscribed', req.lang ) );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

      [ 'romain@cibul.net', 'kaore@cibul.net' ].forEach( mailTo => {

        mailer( {
          subject: 'Nouvel inscrit à la newsletter',
          recipient: mailTo,
          text: '"' + req.body.email + '" a été ajouté à la newsletter.'
        } );

      } )

    }

  } );

}


function _redirectLang( req, res, next ) {

  if ( req.query && req.query.lang && [ 'fr', 'en' ].indexOf( req.query.lang ) === -1 ) {

    return res.redirect( 301, req.genUrl( 'discover', { page: req.params.page, lang: 'en' } ) );

  }

  next();

}


function _redirectLegacyLinks( req, res, next ) {

  if ( legacyPages[ req.params.page ] ) {

    return res.redirect( 301, req.genUrl( 'discover', {
      page: legacyPages[ req.params.page ],
      lang: req.lang
    } ) );

  }

  next();

}


function discover( req, res, next ) {

  let page = landingPages( req.params.page );

  if ( !page ) {

    req.log( 'error', 'unknown page %s', req.params.page );

    return res.redirect( req.genUrl( 'corpoHome', { lang: req.lang } ) );

  }

  if ( req.query.lang && page.getLang() !== req.query.lang) {

    return res.redirect( page.getAlternateUrl( req.lang ) );

  }

  cmn.renderTemplate( req, 'corpo/empty', {}, ( err, layout ) => {

    let content = layout.replace( '<!--content-->', page.render() );

    content = content.replace( '<!--metas-->', page.getHeadPart() );

    res.send( content );

    req.log( 'info', {
      landing: page.getAlternateUrl( 'fr' ).split( '/' ).pop(),
      lang: req.lang,
      message: 'discover page: ' + req.params.page,
      userAgent: req.headers[ 'user-agent' ]
    } );

  } );

}


function start( req, res, next ) {

  const actions = {
    header_signin: req.genUrl( 'signin' ),
    header_signup: req.genUrl( 'signup' ),
    header_phone: 'ok',
    main: req.genUrl( 'signup' ),
    pricing_free: req.genUrl( 'signup' ),
    pricing_custom: config.contactResource,
    pricing_premium: config.contactResource,
    pricing_tailored: config.contactResource,
    bottom: req.genUrl( 'signup' ),
    newsletter: req.genUrl( 'homeShow' )
  }

  let action = Object.keys( actions ).filter( v => req.query.a === v );

  if ( !action.length ) {

    return res.redirect( 301, req.genUrl( 'corpoHome' ) );

  }

  action = action[ 0 ];

  req.log( 'info', {
    message: 'corpo link: ' + action,
    action: action,
    userAgent: req.headers[ 'user-agent' ]
  } );

  console.log( action + ': ' + req.headers[ 'user-agent' ] );

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

function unsubscribeSubmit( req, res ) {

  model.unsubscribed().create( {
    email: req.body.email
  }, function ( err, entry ) {

    if ( err ) {

      cmn.render( req, res, 'general/unsubscribe', {
        email: req.body.email ? req.body.email : '',
        error: err
      } );

    } else {

      sessions.setFlash( req, res, __( 'unsubscribed', { '%email%': req.body.email }, req.lang ) );

      res.redirect( 302, '/' );

    }

  } );

}

function serviceConnectCallback( req, res ) {

  var stateObj,

    tokens;

  try {

    stateObj = new Buffer( req.query.state, 'base64' );

    stateObj = JSON.parse( stateObj );

  } catch ( e ) {

    return cmn.catchError( req, res )( { code: 500, message: 'invalid parameters' } );

  }


  res.redirect( 302, req.genUrl( 'serviceSynchronize', {
    slug: stateObj.slug,
    service: req.params.service,
    code: req.query.code
  } ) );

}