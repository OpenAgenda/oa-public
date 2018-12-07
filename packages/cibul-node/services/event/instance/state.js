"use strict";

var model = require( '../../model' ),

async = require( 'async' ),

log = require( '@openagenda/logger' )( 'event state' ),

utils = require( '@openagenda/utils' ),

TYPES = model.events().STATETYPES;

module.exports = require( '../../lib/instanceLoader' )( ( loaded, instance ) => {

  var onStateChange;

  return {
    setState,
    getState,
    setOnStateChange
  }

  function getState( options, cb ) {

    if ( arguments.length === 1 ) {

      cb = options;
      options = {}

    }

    const params = utils.extend( {
      labelized: true
    }, options );

    if ( !instance.isInAgendaContext() ) {

      return cb( null, instance.getIsDraft() ? 'draft' : _labelize( TYPES.PUBLISHED ) );

    }

    instance.getState( function( err, state ) {

      if ( err ) return cb( err );

      cb( null, params.labelized ? _labelize( state ) : state );

    } );

  }


  function _labelize( state ) {

    const labels = {};

    labels[ TYPES.REFUSED ] = 'refused';
    labels[ TYPES.NOTVALIDATED ] = 'tocontrol';
    labels[ TYPES.VALIDATED ] = 'controlled';
    labels[ TYPES.PUBLISHED ] = 'published';

    return labels[ state ];

  }


  function setState( newState, user, cb ) {

    if ( arguments.length === 2 ) {

      cb = user;
      user = null;

    }

    getState( { labelized: false }, function( err, oldState ) {

      log( 'setting event %s state to %s', instance.id, newState );

      const stateModifiers = {};

      stateModifiers[ TYPES.REFUSED ] = _refuse;
      stateModifiers[ TYPES.PUBLISHED ] = _publish;
      stateModifiers[ TYPES.VALIDATED ] = _validate;
      stateModifiers[ TYPES.NOTVALIDATED ] = _unvalidate;

      if ( [ TYPES.NOTVALIDATED, TYPES.VALIDATED, TYPES.PUBLISHED, TYPES.REFUSED ].indexOf( parseInt( newState ) ) == -1 ) {

        return cb( 'this state is unknown' );

      }

      stateModifiers[ newState ]( instance, ( err, result ) => {

        if ( err ) return cb( err );

        if ( onStateChange ) onStateChange( _labelize( oldState ), _labelize( newState ), user );

        cb( null, result, { oldState, newState } );

      } );

    } );

  }


  function setOnStateChange( cb ) {

    onStateChange = cb;

  }


} );


function _publish( instance, cb ) {

  if ( !instance.isInAgendaContext() ) {

    log( 'undrafting event %s', instance.id );

    return instance.undraft( true, cb );

  }

  log( 'publishing event on agenda' );

  async.series( [
    async.apply( instance.undraft, true ),
    async.apply( instance.setPublished, true )
  ], cb );

}

function _refuse( instance, cb ) {

  async.series( [
    async.apply( instance.setRefused, true )
  ], cb );

}

function _validate( instance, cb ) {

  async.series( [
    async.apply( instance.setValidated, true )
  ], cb );

}

function _unvalidate( instance, cb ) {

  async.series( [
    async.apply( instance.setNotValidated, true )
  ], cb );

}
