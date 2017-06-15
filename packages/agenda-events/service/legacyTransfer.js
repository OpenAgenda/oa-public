"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' ),

  get = require( './get' ),

  create = require( './create' ),

  update = require( './update' ),

  VError = require( 'verror' ),

  states = require( '../iso/states' );

let config, knex;

module.exports = _.extend( legacyTransfer, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function legacyTransfer( originRefId ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let data = await knex( config.legacy.schemas.agendaEvent )
    .first( [ 
      'a.uid as agendaUid', 
      'e.uid as eventUid', 
      'ra.is_published as isPublished', 
      'ra.state as state',
      'ra.featured as featured',
      'ra.updated_at as updatedAt',
      'ra.created_at as createdAt'
    ] )
    .from( config.legacy.schemas.agendaEvent + ' as ra' )
    .leftJoin( config.legacy.schemas.agenda + ' as a', 'ra.review_id', 'a.id' )
    .leftJoin( config.legacy.schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .where( 'ra.id', originRefId ),

    result = null;

  if ( !data ) throw new Error( 'origin reference not found' );

  let shouldUpdate = !!( await get( data.agendaUid, data.eventUid ) );

  result = await ( shouldUpdate ? update : create )( data.agendaUid, data.eventUid, {
    state: _getLegacyState( data.state, data.isPublished ),
    featured: data.featured
  } );

  result.operation = shouldUpdate ? 'update' : 'create';

  return result;

}

function _getLegacyState( state, isPublished ) {

  if ( state === null ) {

    return isPublished ? states.PUBLISHED : states.TOCONTROL;

  }

  return state;

}