"use strict"

const _ = require( 'lodash' );

const eventSearch = require( '@openagenda/event-search' );
const log = require( '@openagenda/logs' )( 'services/eventSearch/agendaIndices' );
const schema = require( '@openagenda/validators/schema' );

const assemble = require( './assemble' );
const rebuild = require( './rebuild' );
const search = require( './search' );

const defaultSearchOptions = {
  detailed: false,
  private: false,
  includeCustom: false
};

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
} );

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
    moreLikeThis: search.moreLikeThis.bind( null, searchIndex ),
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

async function _add( searchIndex, agendaUid, agendaEvent, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'adding event %s to agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'adding event %s to agenda index %s', agendaEvent.eventUid, searchIndex.name );

  const decorated = await assemble.item( agendaEvent );

  const cleanOptions = validateOptions( options );

  return searchIndex.add( decorated, cleanOptions ).then( result => {

    if ( result.success ) {

      log( 'event %s was added to agenda %s', agendaEvent.eventUid, searchIndex.name, cleanOptions );

    } else {

      log( 'error', 'event %s could not be added to agenda %s', agendaEvent.eventUid, searchIndex.name, cleanOptions );

    }

    return result;

  } );

}

async function _update( searchIndex, agendaUid, agendaEvent, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'updating event %s to agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'updating event %s on agenda index %s', agendaEvent.eventUid, searchIndex.name );

  const decorated = await assemble.item( agendaEvent );

  return searchIndex.update( { uid: agendaEvent.eventUid }, decorated, validateOptions( options ) );

}

async function _remove( searchIndex, agendaEvent, options = {} ) {

  if ( !await searchIndex.exists() ) {

    log( 'info', 'removing event %s from agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name );

    return;

  }

  log( 'info', 'removing event %s from agenda index %s', agendaEvent.eventUid, searchIndex.name );

  return searchIndex.remove( { uid: agendaEvent.eventUid }, validateOptions( options ) );

}
