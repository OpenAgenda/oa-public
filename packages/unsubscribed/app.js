"use strict";

const express = require( 'express' );
const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'app' );

module.exports = service => {

  const app = express();

  let path,

  routes = {
    list: '/u/:userUid/list',
    add: '/u/:userUid/s/:subject.:identifier/t/:type',
    remove: '/u/:userUid/s/:subject.:identifier/t/:type/remove'
  };

  app.get( '/u', ( req, res, next ) => {

    res.send( 'ok!' );

  } );

  app.get( routes.add, serviceEndpoint( 'add' ) );

  app.get( routes.list, serviceEndpoint( 'list', false, false, false ) );

  app.get( _typeless( routes.add ), serviceEndpoint( 'add', true, false, true ) );

  app.get( _identifierless( routes.add ), serviceEndpoint( 'add', true, true, false ) );

  app.get( routes.remove, serviceEndpoint( 'remove' ) );

  app.get( _typeless( routes.remove ), serviceEndpoint( 'remove', true, false ) );

  app.get( _identifierless( routes.remove ), serviceEndpoint( 'remove', true, true, false ) );

  return _.extend( {}, app, { genUrl, useBy, routes } );

  function serviceEndpoint( name, useSubject = true, useType = true, useIdentifier = true ) {

    return ( req, res, next ) => {

      if ( req.matchedUnsubscribePath ) return next();

      req.matchedUnsubscribePath = true;

      log( 'matched endpoint to %s, %s, %s', 
        useSubject ? 'use subject' : 'NOT use subject', 
        useType ? 'use type': 'NOT use type', 
        useIdentifier ? 'use identifier' : 'NOT use identifier' );

      const data = {}

      if ( useSubject ) {

        data.subject = req.params.subject;

      }

      if ( useIdentifier ) {

        data.identifier = req.params.identifier;

      }

      if ( useType ) {

        data.type = req.params.type;

      }

      const cb = ( err, result ) => {

        if ( err ) return next( err );

        req.result = result;

        next();

      };

      service( req.params.userUid )[ name ].apply( null, Object.keys( data ).length ? [ data, cb ] : [ cb ] );

    }

  }


  /**
   * Funky Fact: app.path() here does not give the same result
   * ass a service.app.path() call after a simple parentApp.use call
   * outside of service; useBy is a workaround to know what the base
   * path is here. Base path is used by genUrl.
   */
  
  function useBy( parentApp, p = '' ) {

    path = p;

    parentApp.use( p, app );

  }

  function genUrl( name, values = null ) {

    let specificPath = path + routes[ name ];

    _.forIn( values || {}, ( v, k ) => {

      specificPath = specificPath.replace( ':' + k, v );

    } );

    if ( specificPath.indexOf( '/t/:type' ) !== -1 ) {

      return _typeless( specificPath );

    } else if ( specificPath.indexOf( '.:identifier' ) !== -1 ) {

      return _identifierless( specificPath );

    }

    return specificPath;

  }

}

function _identifierless( path ) {

  return path.replace( '.:identifier', '' );

}

function _typeless( path ) {

  return path.replace( '/t/:type', '' );

}