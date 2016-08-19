"use strict";

var model = require( '../../model' ),

utils = require( '../../../lib/utils' ),

w = require( 'when' ),

eventSvc = require( '../../event' ),

search = require( './search' ),

sources = require( './sources' ),

async = require( 'async' ),

logger = require( 'logger' ), log,

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

  _init();

  var instance = model.agendas().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    addEvent,
    removeEvent,
    setContributor: _stakeholderSetter( 'setContributor' ),
    setModerator: _stakeholderSetter( 'setModerator' ),
    setAdministrator: _stakeholderSetter( 'setAdministrator' ),
    events: {
      new: newEvent,
      list: instance.events.list
    },
    refresh
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

    log( 'refreshing agenda id %s', instance.id );

    if ( onRefresh ) onRefresh( instance.id );

    instance.save( { updatedAt: new Date() }, err => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of agenda %s', agenda.uid );

      } else {

        dsp.onRefresh();

      }

      if ( cb ) return cb( err );

    } );
    
  }


  /**
   * add an event to an agenda; same hoop jumping
   * than one described for removeEvent
   */
  function addEvent( event, options, cb ) {

    if ( options.id ) {

      return addEvent( event, { stakeholder: options }, cb );

    }

    let params = utils.extend( {
      stakeholder: null, // required!
      mute: false
    }, options );

    instance.isStakeholder( params.stakeholder, ( err, is ) => {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, params.stakeholder, ( err, result ) => {

        if ( err ) return cb( err );

        if ( !params.mute ) dsp.onAddEvent( event.id );
        
        cb();

      } );
      
    } );

  }

  function newEvent( cb ) {

    var newEventInst = eventSvc.instanciate( instance.events.new() );

    if ( cb ) cb( null, newEventInst );

    return newEventInst;

  }


  /**
   * remove event from agenda. Need to jump through hoops
   * as legacy code took stakeholder as second arg.
   */
  function removeEvent( event, options, cb ) {

    if ( arguments.length == 3 && options.id !== undefined ) {

      return removeEvent( event, { stakeholder: options }, cb );

    }

    if ( arguments.length === 2 ) {

      cb = options;
      options = {};

    }

    w( utils.extend( {
      agenda: instance,
      event,
      stakeholder: null,
      mute: false
    }, options ) )

    .then( _checkIsStakeholder )

    .done( v => {

      instance.removeEvent( v.event, function( err, count ) {

        if ( err ) return cb( err );

        if ( !v.mute ) dsp.onRemoveEvent( event.id );

        cb();

      } );

    }, cb );

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


function _checkIsStakeholder( v ) {

  if ( !v.stakeholder ) return v;

  let d = w.defer();

  v.agenda.isStakeholder( v.stakeholder, ( err, is ) => {

    if ( err ) return d.reject( err );

    if ( !is ) return d.reject( 'you cannot contribute to this agenda' );

    d.resolve( v );

  } );

  return d.promise;

}


function _init() {

  if ( log ) return;

  log = logger( 'services/agenda/instance' );

}