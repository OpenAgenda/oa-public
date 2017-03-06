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

  app.get( _typeless( routes.add ), serviceEndpoint( 'add', false ) );

  app.get( routes.remove, serviceEndpoint( 'remove' ) );

  app.get( _typeless( routes.remove ), serviceEndpoint( 'remove', false ) );

  return _.extend( {}, app, { genUrl, useBy } );

  function serviceEndpoint( name, useType = true ) {

    return ( req, res, next ) => {

      let data = {
        subject: req.params.subject,
        identifier: req.params.identifier
      }

      if ( useType ) {

        data.type = req.params.type;

      }

      service( req.params.userUid )[ name ]( data, ( err, result ) => {

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

    return specificPath.indexOf( '/t/:type' ) !== -1 ? _typeless( specificPath ) : specificPath;

  }

}

function _typeless( path ) {

  return path.replace( '/t/:type', '' );

}