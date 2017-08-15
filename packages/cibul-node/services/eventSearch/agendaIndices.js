"use strict"

const _ = require( 'lodash' );

const logger = require( 'logger' );

const eventSearch = require( 'event-search' );

const assemble = require( './assemble' );

const schema = require( 'validators/schema' );

schema.register( { boolean: require( 'validators/boolean' ) } )

const validateOptions = schema( {
  refresh: {
    type: 'boolean',
    default: true
  }
} );

let log;

module.exports = ( { uid } ) => {

  const searchIndex = eventSearch( `agendas:${uid}` );

  return _.extend( {}, searchIndex, {
    add: _add.bind( null, searchIndex, uid ),
    update: _update.bind( null, searchIndex, uid ),
    remove: _remove.bind( null, searchIndex )
  } );

}

module.exports.init = c => {

  log = logger( 'services/eventSearch/agendaIndices' );

}

async function _add( searchIndex, agendaUid, eventUid, options = {} ) {

  log( 'adding event %s to agenda index %s', eventUid, searchIndex.name );

  const decorated = await assemble.item( { agendaUid, eventUid } );

  return await searchIndex.add( decorated, validateOptions( options ) );

}

async function _update( searchIndex, agendaUid, eventUid, options = {} ) {

  log( 'updating event %s on agenda index %s', eventUid, searchIndex.name );

  const decorated = await assemble.item( { agendaUid, eventUid } );

  return await searchIndex.update( { uid: eventUid }, decorated, validateOptions( options ) );

}

async function _remove( searchIndex, eventUid, options = {} ) {

  log( 'removing event %s from agenda index %s', eventUid, searchIndex.name );

  return await searchIndex.remove( { uid: eventUid }, validateOptions( options ) );

}