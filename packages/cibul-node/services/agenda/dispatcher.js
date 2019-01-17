"use strict";

const redis = require( 'redis' );

const log = require( '@openagenda/logs' )( 'services/agenda/dispatcher' );

const clearReferences = require( '../event/clearReferences' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );


module.exports = agenda => {

  return {
    onRefresh,
    onEventFeaturedChange,
    onEventPublish,
    onEventUnpublish,
    onEventUpdate
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

    if ( !params.refresh ) return;

    agenda.refreshUpdatedAt();

  }


  function onEventUnpublish( event, options ) {

    const params = Object.assign( {
      refresh: true
    }, options || {} );

    log( 'agenda.%s.onEventUnpublish.%s', agenda.id, event.id );

    clearReferences( agenda.id, event.id );

    if ( !params.refresh ) return;

    agenda.refreshUpdatedAt();

  }


  function onEventUpdate( event, options ) {

    agenda.refreshUpdatedAt();

  }


  function onRefresh() {

    log('agenda.%s.onRefresh', agenda.id );

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
