"use strict";

const _ = require( 'lodash' );
const validate = require( '../iso/validate' );
const get = require( './get' );
const create = require( './create' );
const update = require( './update' );
const remove = require( './remove' );
const VError = require( 'verror' );
const getLegacyState = require( './lib/getLegacyState' );

let config, knex;

module.exports = _.extend( legacyTransfer, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function legacyTransfer( origin, options = {} ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  if ( typeof origin === 'object' ) {

    if ( !origin.agendaId ) throw new Error( 'agendaId must be defined for legacy transfer' );

    if ( !origin.eventId ) throw new Error( 'eventId must be defined for legacy transfer' );

  }

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
      'ra.created_at as createdAt',
      'u.uid as userUid'
    ] )
    .from( config.legacy.schemas.agendaEvent + ' as ra' )
    .leftJoin( config.legacy.schemas.agenda + ' as a', 'ra.review_id', 'a.id' )
    .leftJoin( config.legacy.schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .leftJoin( config.legacy.schemas.user + ' as u', 'ra.user_id', 'u.id' )
    .where( where ),

    result = null;


  let current = await get.byLegacyId( origin.agendaId, origin.eventId ),

    values = {
      state: getLegacyState( data.state, data.isPublished ),
      featured: data.featured,
      legacyId: data.agendaId + '.' + data.eventId,
      createdAt: data.createdAt,
      userUid: data.userUid,
      updatedAt: data.updatedAt
    };

  if ( !data && current ) {

    result = await remove.byLegacyId( origin.agendaId, origin.eventId );

    result.operation = 'delete';

  } else if ( data && !current ) {

    result = await create( data.agendaUid, data.eventUid, values, _.extend( { protected: false }, options ) );

    result.operation = 'create';

  } else if ( data && ( current.updatedAt < new Date( data.updatedAt ) ) ) {

    result = await update( data.agendaUid, data.eventUid, values, _.extend( { protected: false }, options ) );

    result.operation = 'update';

  } else {

    result = { operation: null }

  }


  return result;

}