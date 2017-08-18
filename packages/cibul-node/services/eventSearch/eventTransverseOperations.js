"use strict"

const _ = require( 'lodash' );

const logger = require( 'logger' );

const eventSearch = require( 'event-search' );

const agendaEvents = require( 'agenda-events' );

const events = require( 'events-service' );

const agendaIndices = require( './agendaIndices' );

const q = require( 'queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );

let log;

module.exports = _.extend( search, {
  batch: {
    update: batch.bind( null, 'update' ),
    remove: batch.bind( null, 'remove' )
  },
  update,
  add,
  remove,
  init,
  rebuild
} );

const index = eventSearch( 'events' );

async function search( query = null, nav = null, options = null ) {

  return await index.search( query, nav, options );

}

async function update( eventUid ) {

  return index.update( { uid: eventUid }, await _getEvent( eventUid ), { expire: true } );

}

async function add( eventUid, options = {} ) {

  if ( options.queue ) {

    return _queue( 'add', eventUid );

  }

  return index.add( await _getEvent( eventUid ), _.extend( { expire: true }, options ) );

}

async function remove( eventUid ) {

  return index.remove( { uid: eventUid } );

}

async function rebuild() {

  let createdAt = new Date();

  createdAt.setDate( createdAt.getDate() - 90 );

  const max = 1000;

  return index.rebuild( {
    expire: true,
    eventsList: async function( offset, limit ) {

      if ( offset > max ) return [];

      log( 'info', 'rebuilding event index, offset %s', offset );

      return await events.list( { createdAt }, offset, limit, { detailed: true } ).then( r => r.events );

    }
  } );

}

async function batch( method, event, context = {}) {

  // main agenda
  const agendaUid = context.agendaUid;

  if ( agendaUid ) {

    await agendaIndices( agendaUid )[ method ]( event.uid );

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

  const args = { agendaUid, eventUid };

  log( 'queuing index %s for args %s', method, JSON.stringify( args ) );

  q( { method, args } );

}

function init( c ) {

  log = logger( 'services/eventSearch/eventTransverseOperations' );

}