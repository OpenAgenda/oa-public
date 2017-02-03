"use strict";

const image = require( './image' ),

  _ = require( 'lodash' ),

  logger = require( 'basic-logger' ),

  getRoles = require( './getRoles' );

let service, log = console.log;

module.exports = Object.assign( data => {

  return new Instance( data );

}, { init } );

function Instance( data ) {

  if ( !service ) {

    return new Error( 'instanciation service was not initialized' );

  }

  if ( !data.uid ) {

    return new Error( 'identifier uid is not set' );

  }

  Object.assign( this, { data, service, log } );

}

Object.assign(
  Instance.prototype, 
  image,
  {
    getRoles,
    _loadInternals,
    _getExistingRoles
  }
);

function _loadInternals( cb ) {

  service.get( { uid: this.data.uid }, { internal: true }, ( err, agenda ) => {

    if ( err ) return cb( err );

    if ( !agenda ) return cb();

    _.forIn( agenda, ( value, field ) => {

      if ( this.data[ field ] !== undefined ) return;

      this.data[ field ] = value;

    } );

    cb();

  } );

}

function _getExistingRoles() {

  return service.getConfig().existingRoles;

}

function init( svc ) {

  log = logger( 'agendas/instanciate' ),

  service = svc;

}