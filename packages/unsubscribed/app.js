"use strict";

const express = require( 'express' );
const _ = require( 'lodash' );

module.exports = service => {

  const app = express();

  let path,

  routes = {
    add: '/u/:userUid/s/:subject.:identifier/t/:type',
    remove: '/u/:userUid/s/:subject.:identifier/t/:type/remove'
  };

  app.get( '/u', ( req, res, next ) => {

    res.send( 'ok!' );

  } );

  app.get( routes.add, serviceEndpoint( 'add' ) );

  app.get( routes.remove, serviceEndpoint( 'remove' ) );

  return _.extend( {}, app, { genUrl, useBy } );

  function serviceEndpoint( name ) {

    return ( req, res, next ) => {

      service( req.params.userUid )[ name ]( {
        type: req.params.type,
        subject: req.params.subject,
        identifier: req.params.identifier
      }, ( err, result ) => {

        if ( err ) return next( err );

        req.result = result;

        next();

      } );

    }

  }


  /**
   * Funky Fact: app.path() here does not give the same result
   * ass a service.app.path() call after a simple parentApp.use call
   * outside of service; useBy is a workaround to know what the base
   * path is here. Base path is used by genUrl.
   */
  
  function useBy( parentApp, p ) {

    path = p;

    parentApp.use( p, app );

  }

  function genUrl( name, values = null ) {

    let specificPath = path + routes[ name ];

    _.forIn( values || {}, ( v, k ) => {

      specificPath = specificPath.replace( ':' + k, v );

    } );

    return specificPath;

  }

}