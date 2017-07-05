"use strict";

const _ = require( 'lodash' );

const logger = require( 'basic-logger' );

const w = require( 'when' );

const wn = require( 'when/node' );

const sUtils = require( 'service-utils' );

let schemas, service, knex, config, log;

module.exports = Object.assign( remove, { init } );

function remove( identifiers, cb ) {

  w( {
    identifiers,
    event: null,
    success: null
  } )

  .then( sUtils.identifiers.clean() )

  .then( _get )

  .then( _before )

  .then( _doRemove )

  .done( v => {

    if ( v.success && config.interfaces && config.interfaces.onRemove ) {

      config.interfaces.onRemove( v.event );

    }

    cb( null, {
      success: v.success
    } );

  }, cb );

}


function _doRemove( v ) {

  if ( !v.event ) return v;

  return knex( schemas.event )

  .update( 'deleted_at', new Date() )

  .where( 'id', v.event.id )

  .then( affected => {

    v.success = !!affected;

    return v;

  } );

}


function _before( v ) {

  if ( !config.interfaces || !config.interfaces.beforeRemove || !v.event ) {

    return v;    

  }

  return wn.call( config.interfaces.beforeRemove, v.event )

  .then( () => v );

}


function _get( v ) {

  return wn.call( service.get, v.identifiers, { internal: true, private: null } )

  .then( event => {

    v.event = event;

    return v;

  } );

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'event service.remove' );

}