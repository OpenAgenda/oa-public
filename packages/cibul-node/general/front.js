"use strict";

var modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  config = require( '../config' ),

  newsletter = require( 'newsletter' ),

  mailer = require( 'mailer' ),

  model = require( '../services/model' ),

  metaLabels = require( 'labels' )( require( 'labels/corpo/metas' ) ),

  agendas = require( 'agendas' ),

  mwHelpers = require( '../services/lib/middlewareHelpers.js' ),

  path,

  coms = require( '../lib/coms' ),

  w = require( 'when' ),

  routes = {
    corpoHome: [ 'get', '/', [ 
      cmn.loadBaseData( 'oasfmain.css' ), 
      _corpoBrowserCache,
      corpo 
    ] ],
    newsletterSubscribe: [ 'post', '/newsletter/subscribe', newsletterSubscribe ],
    serviceConnectCallback: [ 'get', '/services/:service/connect/callback', serviceConnectCallback ],
    emailUnsubscribe: [ 'get', '/unsubscribe', unsubscribe ],
    emailUnsubscribeSubmit: [ 'post', '/unsubscribe', unsubscribeSubmit ],
    start: [ 'get', '/start', start ]
  };

module.exports = function ( p ) {

  path = p;

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'general' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( 'oa.css' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function _corpoBrowserCache( req, res, next ) {

  mwHelpers.compareModifiedSince( config.corpoLastUpdate, req, res, next );

}


function corpo( req, res, next ) {

  cmn.https( req, res, () => {

    if ( req.session.logged ) {

      res.redirect( 302, req.genUrl( 'homeShow' ) );

      return;

    }

    getStats()
      .then( ( [ agendas, contributors, events ] ) => {

        cmn.render( req, res, 'corpo/index', {
          metas: {
            title: metaLabels( 'title', req.lang ),
            description: metaLabels( 'description', req.lang ),
            keywords: metaLabels( 'keywords', req.lang ),
            robots: 'index, follow'
          },
          scriptParams : {
            lang: req.lang || 'fr',
            stats: {
              agendas,
              contributors,
              events
            }
          }
        } );

      }, err => next( err ) );

  } );

}

function getStats() {

  return Promise.all( [
    getTotalAgendas(),
    getTotalContributors(),
    getTotalEvents()
  ] );

}


function getTotalAgendas() {

  const con = model.lib.getConnection();

  return new Promise( ( resolve, reject ) => {

    con.query( 'SELECT COUNT(*) AS reviews FROM review', function ( err, rows ) {
      if ( err ) reject( err );
      resolve( rows[ 0 ].reviews );
    } );

  } );

}

function getTotalContributors() {

  const con = model.lib.getConnection();

  return new Promise( ( resolve, reject ) => {

    con.query( 'SELECT COUNT(*) AS reviewers FROM reviewer', function ( err, rows ) {
      if ( err ) reject( err );
      resolve( rows[ 0 ].reviewers );
    } );

  } );

}

function getTotalEvents() {

  const con = model.lib.getConnection();

  return new Promise( ( resolve, reject ) => {

    con.query( 'SELECT COUNT(*) AS events FROM event', function ( err, rows ) {
      if ( err ) reject( err );
      resolve( rows[ 0 ].events );
    } );

  } );

}


function newsletterSubscribe( req, res ) {

  newsletter.addSubscriber( req.body.email, ( err, result ) => {

    if ( err ) {

      req.log( 'error', { service: 'newsletter', message: result.message, error: result.message } );

      res.setFlash( req, 'Either the email is invalid or the newsletter service is unavailable. Please try again later.' );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

    } else {

      res.setFlash( req, 'You have been added to the newsletter list. Thanks!' );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

      mailer( {
        subject: 'Nouvel inscrit à la newsletter',
        recipient: [ 'romain@cibul.net', 'kaore@cibul.net' ],
        text: '"' + req.body.email + '" a été ajouté à la newsletter.'
      } );

    }

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

      res.setFlash( req, 'You will from now on no longer receive event emails at the address %email%', { '%email%': req.body.email } );

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