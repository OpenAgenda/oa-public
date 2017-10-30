"use strict"

const _ = require( 'lodash' );
const search = require( './search' );
const rebuild = require( './rebuild' );
const assemble = require( './assemble' );
const eventSearch = require( 'event-search' );
const schema = require( 'validators/schema' );
const log = require( 'logs' )( 'services/eventSearch/agendaIndices' );

const defaultSearchOptions = {
  detailed: false,
  private: false,
  includeCustom: false
};

schema.register( { boolean: require( 'validators/boolean' ) } )

const validateOptions = schema( {
  refresh: {
    type: 'boolean',
    default: true
  }
} );

module.exports = agendaUid => {

  const searchIndex = eventSearch( `agendas:${agendaUid}` );

  return _.extend( {}, searchIndex, {
    exists: searchIndex.exists,
    stream: _stream.bind( null, searchIndex, agendaUid ),
    search: _search.bind( null, searchIndex, agendaUid ),
    rebuild: rebuild.bind( null, searchIndex, agendaUid ),
    add: _add.bind( null, searchIndex, agendaUid ),
    update: _update.bind( null, searchIndex, agendaUid ),
    remove: _remove.bind( null, searchIndex )
  } );

}

module.exports.init = c => {

  assemble.init( c );

}

function _stream( searchIndex, agendaUid, query, options ) {

  return search.stream( searchIndex, agendaUid, query, options );

}

function _search( searchIndex, agendaUid, query, nav, options ) {

  // doing a bit of cleaning here could prove useful
  return search( searchIndex, agendaUid, query, nav, options );

}

async function _add( searchIndex, agendaUid, eventUid, state, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'adding event %s to agenda index %s: index does not exist', eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'adding event %s to agenda index %s', eventUid, searchIndex.name );

  const decorated = await assemble.item( { agendaUid, eventUid, state } );

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