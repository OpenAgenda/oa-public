"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

const image = require( './image' );
const validate = require( '../validate' );

const publicValidate = require( '../validate/public' );

let service, log = console.log;

module.exports = Object.assign( Agenda, { init } );

function Agenda( data ) {

  if ( !service ) {

    return new Error( 'instanciation service was not initialized' );

  }

  if ( !data.uid ) {

    return new Error( 'identifier uid is not set' );

  }

  Object.assign( this, { data, service, log } );

}

Object.assign(
  Agenda.prototype,
  image,
  {
    getData,
    _loadInternals
  }
);

function _loadInternals( cb ) {

  service.get( { uid: this.data.uid }, { internal: true, private: null }, ( err, agenda ) => {

    if ( err ) return cb( err );

    if ( !agenda ) return cb();

    _.forIn( agenda, ( value, field ) => {

      if ( this.data[ field ] !== undefined ) return;

      this.data[ field ] = value;

    } );

    cb();

  } );

}

function getData( options ) {

  const params = _.extend( {
    internal: false
  }, options || {} );

  return params.internal ? this.data : publicValidate( this.data );

}

function init( svc ) {

  log = logger( 'agendas/instanciate' ),

    service = svc;

}
