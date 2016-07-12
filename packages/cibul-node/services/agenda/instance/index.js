"use strict";

var model = require( '../../model' ),

utils = require( '../../../lib/utils' ),

eventSvc = require( '../../event' ),

search = require( './search' ),

sources = require( './sources' ),

async = require( 'async' ),

log = require( 'logger' )( 'agenda service instance' ),

cache = require( '../../cache' ),

flattener = require( './flattener' ),

aggregator = require( '../../aggregator' ),

emailStrategie = require( './emailStrategie' ),

groupActions = require( './groupActions' ),

controlData = require( '../controlData' ),

dispatcher = require( './dispatcher' ),

instanceQueue = require( '../../lib/instanceQueue' ),

onRefresh;

module.exports = instanciate;

module.exports.test = {
  setOnRefresh: setOnRefresh
}

function instanciate( data ) {

  var instance = model.agendas().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    addEvent: addEvent,
    removeEvent: removeEvent,
    setContributor: _stakeholderSetter( 'setContributor' ),
    setModerator: _stakeholderSetter( 'setModerator' ),
    setAdministrator: _stakeholderSetter( 'setAdministrator' ),
    events: {
      new: newEvent,
      list: instance.events.list
    },
    refresh: refresh
  }),

  dsp = dispatcher( svcInstance, instance );

  instance.onSave = dsp.onSave;

  instanceQueue( svcInstance, instance, [
    'queue'
  ] );

  search( svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate',
    'resync'
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


  function refresh( cb ) {

    if ( onRefresh ) onRefresh( instance.id );

    instance.save( { updatedAt: new Date() }, ( err ) => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of agenda %s', agenda.uid );

      } else {

        dsp.onRefresh();

      }

      if ( cb ) return cb( err );

    } );
    
  }


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

  function newEvent( cb ) {

    var newEventInst = eventSvc.instanciate( instance.events.new() );

    if ( cb ) cb( null, newEventInst );

    return newEventInst;

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


  /**
   * proxy method to db instance; does a little refresh on the way
   */

  function _stakeholderSetter( methodName ) {

    return function( user, options, cb ) {

      if ( arguments.length === 2 ) {

        cb = options;
        options = {};

      }

      instance[ methodName ]( user, options, err => {

        if ( err ) return cb( err );

        dsp.onRefresh();

        cb();

      });

    };

  }
  
}

function setOnRefresh( cb ) {

  onRefresh = cb;

}