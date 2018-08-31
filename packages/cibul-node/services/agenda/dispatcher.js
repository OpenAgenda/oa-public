"use strict";

const redis = require( 'redis' );

const log = require( '@openagenda/logs' )( 'services/agenda/dispatcher' );

const clearReferences = require( '../event/clearReferences' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );

let aggregator, // loaded through require

  controlData,

  eventSvc;

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
      userId
    } );

  }


  function onEventFeaturedChange( event ) {

    log( 'agenda.%s.onEventFeaturedChange.%s', agenda.id, event.id );

  }


  function onEventPublish( event, options ) {

    const params = Object.assign( {
      refresh: true
    }, options || {} );

    // legacy
    log( 'agenda.%s.onEventPublish.%s' , agenda.id, event.id );

    aggregator.notifyPublish( event.id, agenda.id, !params.refresh /* mute */ );

    if ( !params.refresh ) return;

    agenda.refreshUpdatedAt();

  }


  function onEventUnpublish( event, options ) {

    const params = Object.assign( {
      refresh: true
    }, options || {} );

    log( 'agenda.%s.onEventUnpublish.%s', agenda.id, event.id );

    clearReferences( agenda.id, event.id );

    aggregator.notifyUnpublish( event.id, agenda.id );

    if ( !params.refresh ) return;

    agenda.refreshUpdatedAt();

  }


  function onEventUpdate( event, options ) {

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
