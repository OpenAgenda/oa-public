"use strict"

const _ = require( 'lodash' );
const logger = require( '@openagenda/logger' );
const events = require( '@openagenda/events' );
const eventSearch = require( '@openagenda/event-search' );
const agendaEvents = require( '@openagenda/agenda-events' );
const agendaIndices = require( './agendaIndices' );
const rebuildLimit = process.env.NODE_ENV === 'production' ? 16000 : 2000;
const log = require( '@openagenda/logs' )( 'services/eventSearch/eventTransverseOperations' );
const q = require( '@openagenda/queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );
const VError = require( 'verror' );

module.exports = _.extend( search, {
  batch: {
    update: batch.bind( null, 'update' ),
    remove: batch.bind( null, 'remove' )
  },
  update,
  add,
  remove,
  rebuild
} );

const index = eventSearch( 'events' );

async function search( query = null, nav = null, options = null ) {

  return await index.search( query, nav, options );

}

async function update( eventUid ) {

  return await index.update( { uid: eventUid }, await _getEvent( eventUid ), { expire: true } );

}

async function add( eventUid, options = {} ) {

  if ( options.queue ) {

    return _queue( 'add', eventUid );

  }

  const result = await index.add( await _getEvent( eventUid ), _.extend( { expire: true }, options ) );

  if ( !result.success && result.message === 'negative ttl set' ) {

    log( 'info', 'past event was not indexed', { eventUid } );

    return {
      success: true
    }

  }

  return result;

}

async function remove( eventUid ) {

  log( 'info', 'removing event %d from transverse index', eventUid );

  return index.remove( { uid: eventUid } );

}

async function rebuild() {

  const createdAt = new Date();

  createdAt.setDate( createdAt.getDate() - 120 );

  return index.rebuild( {
    expire: true,
    eventsList: async ( offset, limit ) => {

      if ( offset > rebuildLimit ) return [];

      log( 'info', 'rebuilding event index, offset %s', offset );

      return events.list( { createdAt }, offset, limit, { detailed: true, html: true } ).then( r => r.events );

    }
  } );

}


/**
 * unused in normal lifecycle of app. agendaEvent interfaces ensure event
 * removal from agenda indices
 */
async function batch( method, event, context = {}) {

  // main agenda
  const { agendaUid, updateEventSearchIndex } = context;

  if ( agendaUid && updateEventSearchIndex ) {

    const ae = await agendaEvents( agendaUid ).get( event.uid );
    
    if ( ae ) {

      await agendaIndices( agendaUid )[ method ]( ae );

    }

  }

  _queue( method, event.uid );

  // secondary agendas
  ( await agendaEvents.list.byEventUid( event.uid, 0, 1000 ) ).items

    .map( i => i.agendaUid )

    .filter( aUid => aUid !== agendaUid )

    .forEach( _queue.bind( null, method, event.uid ) );

}

async function _getEvent( eventUid ) {

  const event = await events.get( { uid: eventUid }, { private: null } );

  if ( !event ) throw new VError( 'Event %s not found', eventUid );

  return event;

}

function _queue( method, eventUid, agendaUid = null ) {

  const args = { agendaUid, eventUid };

  log( 'queuing index %s for args %s', method, JSON.stringify( args ) );

  q( { method, args } );

}
