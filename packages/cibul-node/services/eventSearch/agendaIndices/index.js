"use strict"

const _ = require( 'lodash' );
const logger = require( 'logger' );
const search = require( './search' );
const rebuild = require( './rebuild' );
const assemble = require( './assemble' );
const eventSearch = require( 'event-search' );
const schema = require( 'validators/schema' );

schema.register( { boolean: require( 'validators/boolean' ) } )

const validateOptions = schema( {
  refresh: {
    type: 'boolean',
    default: true
  }
} );

let log;

module.exports = agendaUid => {

  const searchIndex = eventSearch( `agendas:${agendaUid}` );

  return _.extend( {}, searchIndex, {
    exists: searchIndex.exists,
    search: search.bind( null, searchIndex, agendaUid ),
    rebuild: rebuild.bind( null, searchIndex, agendaUid ),
    add: _add.bind( null, searchIndex, agendaUid ),
    update: _update.bind( null, searchIndex, agendaUid ),
    remove: _remove.bind( null, searchIndex )
  } );

}

module.exports.init = c => {

  log = logger( 'services/eventSearch/agendaIndices' );

  assemble.init( c );

  search.init( c );

}

async function _add( searchIndex, agendaUid, eventUid, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'adding event %s to agenda index %s: index does not exist', eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'adding event %s to agenda index %s', eventUid, searchIndex.name );

  const decorated = await assemble.item( { agendaUid, eventUid } );

  return await searchIndex.add( decorated, validateOptions( options ) );

}

async function _update( searchIndex, agendaUid, eventUid, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'updating event %s to agenda index %s: index does not exist', eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'updating event %s on agenda index %s', eventUid, searchIndex.name );

  const decorated = await assemble.item( { agendaUid, eventUid } );

  return await searchIndex.update( { uid: eventUid }, decorated, validateOptions( options ) );

}

async function _remove( searchIndex, eventUid, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'removing event %s from agenda index %s: index does not exist', eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'removing event %s from agenda index %s', eventUid, searchIndex.name );

  return await searchIndex.remove( { uid: eventUid }, validateOptions( options ) );

}