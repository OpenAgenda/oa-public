"use strict";

var model = require( '../../model' ),

async = require( 'async' ),

log = require( '../../../lib/logger' )( 'event state' ),

TYPES = model.events().STATETYPES;

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  var onStateChange;

  return {
    setState: setState,
    getState: getState,
    setOnStateChange: setOnStateChange
  }

  function getState( cb ) {

    if ( !instance.isInAgendaContext() ) { 

      return cb( null, instance.getIsDraft() ? 'draft' : _labelize( TYPES.PUBLISHED )  );

    }

    instance.getState( function( err, state ) {

      if ( err ) return cb( err );

      instance.getPublished( function( err, isPublished ) {

        if ( err ) return cb( err );

        if ( isPublished ) {

          state = TYPES.PUBLISHED;

        } else if ( state === null ) {

          return cb( null, 'draft' );

        }

        cb( null, _labelize( state ) );

      });

    } );

  }


  function _labelize( state ) {

    var labels = {};

    labels[ TYPES.NOTVALIDATED ] = 'tocontrol';
    labels[ TYPES.VALIDATED ] = 'controlled';
    labels[ TYPES.PUBLISHED ] = 'published';

    return labels[ state ];

  }


  function setState( newState, cb ) {

    getState( function( err, oldState ) {

      log( 'setting event %s state to %s', instance.id, newState );

      var stateModifiers = {};

      stateModifiers[ TYPES.PUBLISHED ] = _publish;
      stateModifiers[ TYPES.VALIDATED ] = _validate;
      stateModifiers[ TYPES.NOTVALIDATED ] = _unvalidate;

      if ( [ TYPES.NOTVALIDATED, TYPES.VALIDATED, TYPES.PUBLISHED ].indexOf( parseInt( newState, 10 ) ) == -1 ) {

        cb( 'this state is unknown' );

      }

      stateModifiers[ newState ]( instance, function( err, result ) {

        if ( err ) return cb( err );

        if ( onStateChange ) onStateChange( oldState, _labelize( newState ) );

        cb( null, result );

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
    async.apply( instance.setPublished, true ),
    async.apply( instance.setValidated, true )
  ], cb );

}

function _validate( instance, cb ) {

  async.series( [
    async.apply( instance.setUnpublished, true ),
    async.apply( instance.setValidated, true )
  ], cb );

}

function _unvalidate( instance, cb ) {

  async.series( [
    async.apply( instance.setUnpublished, true ),
    async.apply( instance.setNotValidated, true )
  ], cb );

}