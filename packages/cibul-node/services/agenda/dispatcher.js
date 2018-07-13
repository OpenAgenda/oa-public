"use strict";

var aggregator, // loaded through require

controlData,

eventSvc,

logger = require( '@openagenda/logger' ), log,

coms = require( '../../lib/coms' ),

config = require( '../../config' ),

clearReferences = require( '../event/clearReferences' ),

redis = require( 'redis' );

module.exports = agenda => {

  _requires();

  return {
    onRefresh,
    onEventFeaturedChange,
    onEventPublish,
    onEventUnpublish,
    onEventUpdate,
    onSetStakeholder
  }


  function onSetStakeholder( userId, action ) {

    log( 'dispatching agenda id %s, for stakeholder %s set to %s', agenda.id, userId, action );

    controlData.queue( agenda.id, {
      type: 'stakeholderSet',
      userId: userId
    } );

  }


  function onEventFeaturedChange( event ) {

    log( 'agenda.%s.onEventFeaturedChange.%s', agenda.id, event.id );

  }


  function onEventPublish( event, options ) {

    let params = Object.assign( {
      refresh: true
    }, options || {} );

    // legacy
    log( 'agenda.%s.onEventPublish.%s' , agenda.id, event.id );

    aggregator.notifyPublish( event.id, agenda.id, !params.refresh /* mute */ );

    if ( !params.refresh ) return;

    controlData.queue( agenda.id, {
      type: 'eventPublish',
      eventId: event.id
    } );

    agenda.refreshUpdatedAt();

  }


  function onEventUnpublish( event, options ) {

    let params = Object.assign( {
      refresh: true
    }, options || {} );

    log( 'agenda.%s.onEventUnpublish.%s', agenda.id, event.id );

    clearReferences( agenda.id, event.id );

    aggregator.notifyUnpublish( event.id, agenda.id );

    if ( !params.refresh ) return;

    controlData.queue( agenda.id, {
      type: 'eventRemove',
      eventId: event.id
    } );

    agenda.refreshUpdatedAt();

  }


  function onEventUpdate( event, options ) {

    const params = Object.assign( {
      refresh: true
    }, options || {} );

    log( 'agenda.%s.onEventUpdate.%s', agenda.id, event.id );

    event.getState( ( err, state ) => {

      if ( err ) return log( 'error', 'failed to load event %s state', event.id );

      if ( state === 'published' ) {

        controlData.queue( agenda.id, {
          type: 'eventUpdate',
          eventId: event.id
        } );

      }

    } );

    agenda.refreshUpdatedAt();

  }


  function onRefresh() {

    log('agenda.%s.onRefresh', agenda.id );

    controlData.queue( agenda.id, {
      type: 'reset',
    } );

    _legacyCredCacheClear( agenda.id );

    agenda.refreshUpdatedAt();

  }

}


function _legacySearchUpdate( eventId ) {

  coms.publish( config.mainChannel, {
    name: 'search.update',
    values: { id: eventId }
  } );

}


function _legacyCredCacheClear( agendaId ) {

  var cli = redis.createClient( config.redis.port, config.redis.host );

  cli.del( `review:${agendaId}:ft`, ( err, result ) => {

    if ( err ) {

      return log( 'error', { method: '_legacyCredCacheClear', error: err } );

    }

    cli.quit();

  } );

}


function _requires() { // me no liky circular dependency

  if ( !aggregator ) {

    aggregator = require( '../aggregator' );

  }

  if ( !controlData ) {

    controlData = require( './controlData' );

  }

  if ( !eventSvc ) {

    eventSvc = require( '../event' );

  }

  if ( !log ) {

    log = logger( 'services/agenda/dispatcher' );

  }

}
