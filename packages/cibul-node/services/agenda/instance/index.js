"use strict";

var model = require( '../../model' ),

utils = require( '../../../lib/utils' ),

eventSvc = require( '../../event' ),

search = require( './search' ),

sources = require( './sources' ),

async = require( 'async' ),

cache = require( '../../cache' ),

flattener = require( './flattener' ),

aggregator = require( '../../aggregator' ),

emailStrategie = require( './emailStrategie' ),

groupActions = require( './groupActions' ),

controlData = require( './controlData' ),

dispatcher = require( './dispatcher' );

module.exports = function( data ) {

  var instance = model.agendas().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    addEvent: addEvent,
    removeEvent: removeEvent
  }),

  dsp = dispatcher( svcInstance, instance );

  search( svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate'
  ]);

  sources( svcInstance, instance, [
    'sources.add',
    'sources.remove'
  ]);

  flattener( svcInstance, instance, [
    'flattener'
  ] );

  emailStrategie( svcInstance, instance, [ 
    'emailStrategie'
  ] );

  groupActions( svcInstance, instance, [
    'changeEventStates'
  ] );

  controlData( svcInstance, instance, [
    'getControlData'
  ] );

  return cache( 'agenda', svcInstance, [], [ 'addEvent', 'removeEvent' ] );


  function addEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, stakeholder, function( err, result ) {

        if ( err ) return cb( err );

        dsp.onAddEvent( event.id );
        
        cb();

      } );
      
    } );


  }

  function removeEvent( event, stakeholder, cb ) {

    if ( arguments.length == 3 ) {

      return instance.isStakeholder( stakeholder, function( err, is ) {

        if ( err ) return cb( err );

        if ( !is ) return cb( 'you cannot contribute to this agenda' );

        removeEvent( event, cb );

      } );

    }

    cb = stakeholder;

    instance.removeEvent( event, function( err, count ) {

      if ( err ) return cb( err );

      dsp.onRemoveEvent( event.id );

      cb();

    });

  }
  
}