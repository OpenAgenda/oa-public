"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const utils = require( 'utils' );

const get = require( './get' );

const validate = require( '../iso/validate' );

let config, knex;

module.exports = _.extend( set, { 
  init: ( c, k ) => { config = c; knex = k }
} );

function set( agendaId, eventId, values, cb ) {

  if ( arguments.length === 3 ) {

    cb = values;
    values = {};

  }

  let clean, errors = [];

  if ( !knex ) return cb( 'service not initialized' );

  try {

    clean = validate( _.extend( {}, values, { eventId, agendaId } ) );

  } catch( e ) {

    errors = e;

  }

  if ( errors.length ) {

    return cb( null, {
      success: false, 
      valid: false, 
      errors 
    } );

  }

  w( {
    values: _.extend( clean, { updatedAt: new Date() } ),
    current: null,
    success: false,
    valid: true,
    errors: []
  } )

  .then( _get )

  .then( _create )

  .then( _update )

  .done( v => {

    cb( null, _.extend( {
      success: v.success,
      valid: v.valid,
      errors: v.errors,
      agendaEvent: v.agendaEvent
    }, v.current ? { 
      updated: true,
      previous: v.current
    } : {
      created: true
    } ) );

  } );

}

function _update( v ) {

  let { current, values } = v;

  if ( !current ) return v;

  let update = _.extend( {}, current, v.values );

  return knex( config.schemas.agendaEvent )
  
    .update( utils.toUnderscore( update ) )

    .where( {
      event_id: v.values.eventId,
      agenda_id: v.values.agendaId
    } )

  .then( affectedRows => {

    if ( affectedRows !== 1 ) {

      v.affectedRows = affectedRows;

      return v;

    }

    v.success = true;

    v.agendaEvent = update;

    if ( config.interfaces && config.interfaces.onUpdate ) {

      config.interfaces.onUpdate( current, v.agendaEvent );

    }

    return v;

  } );

}

function _create( v ) {

  if ( v.current ) return v;

  let create = _.extend( {}, v.values, { createdAt: new Date() } );

  return knex( config.schemas.agendaEvent )

    .insert( utils.toUnderscore( create ) )

    .then( insertIds => {

      if ( insertIds.length !== 1 ) {

        v.result = { insertIds: insertIds };

        return v;

      }

      v.agendaEvent = _.extend( {}, create, { id: insertIds[ 0 ] } );

      if ( config.interfaces && config.interfaces.onCreate ) {

        config.interfaces.onCreate( v.agendaEvent );

      }

      v.success = true;

      return v;

    } );

}

function _get( v ) {

  let { eventId, agendaId } = v.values;

  let d = w.defer();

  get( agendaId, eventId, ( err, agendaEvent ) => {

    if ( err ) return d.reject( err );

    v.current = agendaEvent;

    d.resolve( v );

  } );

  return d.promise;

}