"use strict";

const _ = require( 'lodash' );

const service = require( './' );

module.exports = ( namespace, identifierPath, onSuccess ) => {

  return ( req, res, next ) => {

    let identifier = _.get( req, identifierPath, null );

    if ( identifier === null ) return next();

    service( namespace, identifier ).get( req.url, ( err, value ) => {

      if ( err ) return next( err );

      if ( value !== null ) return onSuccess( value, req, res, next );

      next();

    } );

  }

}