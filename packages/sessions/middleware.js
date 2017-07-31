"use strict";

const _ = require( 'lodash' );
const cookieSessionLib = require( 'cookie-session' );
const cookieParserLib = require( 'cookie-parser' );
const validateCookie = require( './iso/cookie.validate' );

let cookieSession, cookieParser, sessions;

module.exports = _.extend( use, {
  open,
  load,
  close,
  sync,
  ifLogged: ifLoggedState.bind( null, true ),
  ifUnlogged: ifLoggedState.bind( null, false ),
  init
} );


function use( req, res, next ) {

  if ( !cookieSession ) {

    throw new Error( 'Session service not initialized' );

  }

  cookieParser( req, res, err => {

    cookieSession( req, res, err => {

      if ( err ) return next( err );

      if ( Object.keys( req.session ).length ) {

        return next();

      }
  
      Object.keys( validateCookie.validateUnlogged.default ).forEach( k => {

        req.session[ k ] = validateCookie.validateUnlogged.default[ k ];

      } );  

      next();

    } );  

  } );

}



function ifLoggedState( state, fn ) {

  return ( req, res, next ) => {

    sessions.isLogged( req )

      .catch( next )

      .then( is => {

        if ( state === is ) return fn( req, res, next );

        next();

      } )

  }

}


function close( targetNamespace = 'result' ) {

  return ( req, res, next ) => {

    sessions.close( req, ( err, result ) => {

      if ( err ) return next( err );

      req[ targetNamespace ] = result;

      next();

    } );

  }

}


/**
 * proxy for service sync method
 */
function sync( targetNamespace = 'result' ) {

  return ( req, res, next ) => {

    sessions.sync( req, ( err, result ) => {

      if ( err ) return next( err );

      req[ targetNamespace ] = result;

      next();

    } );

  }

}


function open( identifierNamespace = 'userIdentifier', targetNamespace = 'result' ) {

  return ( req, res, next ) => {

    sessions.open( req, req[ identifierNamespace ], ( err, result ) => {

      if ( err ) return next( err );

      req[ targetNamespace ] = result;

      next();

    } );

  }

}

/**
 * load session in req object
 */

function load( options ) {

  let params = _.extend( {
    target: 'user',
    detailed: false
  }, options || {} );

  return ( req, res, next ) => {

    sessions.get( req, { detailed: params.detailed }, ( err, user ) => {

      if ( err ) return next( err );

      req[ params.target ] = user;

      _logLoad( req, { userUid: user ? user.uid : null } );

      next();

    } );

  }

}


function init( config, service ) {

  cookieSession = cookieSessionLib( config.sessionCookie );

  cookieParser = cookieParserLib();

  sessions = service;

}


function _logLoad( req, data ) {

  if ( req.log && req.log.load ) {

    req.log.load( data );

  }

}