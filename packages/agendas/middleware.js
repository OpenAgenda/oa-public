"use strict";

const _ = require( 'lodash' );

let service, config;

module.exports = {
  init,
  load
}

function load( options ) {

  let { namespaces, instanciate, detailed } = _.merge( {
    instanciate: false,
    detailed: false,
    namespaces: {
      identifiers: {      
        id: 'agendaId',
        uid: 'agendaUid',
        slug: 'agendaSlug',
      },
      result: 'agenda'
    }
  }, options || {} );

  return ( req, res, next ) => {

    let identifiers = {};

    _.forIn( namespaces.identifiers, ( v, k ) => {

      if ( !v ) return;

      identifiers[ k ] = _.get( req, v );

    } );

    service.get( identifiers, { instanciate, detailed }, ( err, agenda ) => {

      if ( err ) return next( err );

      _.set( req, namespaces.result, agenda );

      next();

    } );

  }

}

function init( c, svc ) {

  service = svc;
  config = c;

}