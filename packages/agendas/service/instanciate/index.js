"use strict";

const image = require( './image' ),

logger = require( 'basic-logger' );

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
  image
);

function init( svc ) {

  log = logger( 'agendas/instanciate' ),

  service = svc;

}