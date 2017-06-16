"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' ),

  get = require( './get' ),

  create = require( './create' ),

  update = require( './update' ),

  remove = require( './remove' ),

  VError = require( 'verror' ),

  states = require( '../iso/states' );

let config, knex;

module.exports = _.extend( legacyTransfer, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function legacyTransfer( origin ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let where = typeof origin === 'object' ? {
    'ra.review_id': origin.agendaId,
    'ra.event_id': origin.eventId 
  } : { 'ra.id': origin };

  let data = await knex( config.legacy.schemas.agendaEvent )
    .first( [ 
      'a.uid as agendaUid', 
      'e.uid as eventUid', 
      'a.id as agendaId',
      'e.id as eventId',
      'ra.is_published as isPublished', 
      'ra.state as state',
      'ra.featured as featured',
      'ra.updated_at as updatedAt',
      'ra.created_at as createdAt'
    ] )
    .from( config.legacy.schemas.agendaEvent + ' as ra' )
    .leftJoin( config.legacy.schemas.agenda + ' as a', 'ra.review_id', 'a.id' )
    .leftJoin( config.legacy.schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .where( where ),

    result = null;

  let current = await get.byLegacyId( origin.agendaId, origin.eventId );

  if ( !data && current ) {

    result = await remove.byLegacyId( origin.agendaId, origin.eventId );

    result.operation = 'delete';

  } else if ( data ) {

    result = await ( current ? update : create )( data.agendaUid, data.eventUid, {
      state: _getLegacyState( data.state, data.isPublished ),
      featured: data.featured,
      legacyId: data.agendaId + '.' + data.eventId
    } );

    result.operation = current ? 'update' : 'create';

  } else {

    result = { operation: null }

  }


  return result;

}

function _getLegacyState( state, isPublished ) {

  if ( isPublished ) {

    return states.PUBLISHED;

  }

  return state;

}