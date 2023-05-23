"use strict";

var model = require( '../../model' ),

  utils = require( '../../../lib/utils' ),

  w = require( 'when' ),

  extAgendaSvc = require( '@openagenda/agendas' ),

  legacyEventSvc = require( '../../event' ),

  search = require( './search' ),

  log = require( '@openagenda/logs' )( 'services/agenda/instance' ),

  cache = require( '../../cache' ),

  config = require( '../../../config' );

module.exports = instanciate;

function instanciate( data ) {

  var instance = model.agendas().instance( data ),

    svcInstance = utils.extend( {}, instance, {
      getContributionSettings,
      events: {
        new: newEvent,
        list: instance.events.list,
        get: instance.events.get
      },
      refreshUpdatedAt
    } );

  search( svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate',
    'resync'
  ] );

  return cache( 'agenda', svcInstance, [], [ 'addEvent', 'removeEvent' ] );


  function refreshUpdatedAt() {

    instance.save( { updatedAt: new Date() }, err => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of agenda %s: %s', instance.id, err );

      }

    } );

  }


  function newEvent( cb ) {

    var newEventInst = legacyEventSvc.instanciate( instance.events.new() );

    if ( cb ) cb( null, newEventInst );

    return newEventInst;

  }


  function getContributionSettings( cb ) {

    extAgendaSvc.get( { id: instance.id }, { private: null }, ( err, agenda ) => {

      if ( err || !agenda ) return cb( err || 'agenda not found' );

      cb( null, agenda.settings.contribution );

    } );

  }
}