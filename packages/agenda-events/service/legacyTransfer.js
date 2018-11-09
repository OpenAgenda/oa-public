"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'legacyTransfer' );

const validate = require( '../iso/validate' );
const getLegacyState = require( './lib/getLegacyState' );
const toLegacyState = require( './lib/toLegacyState' );

let config, knex, service;

module.exports = _.extend( legacyTransfer, {
  init: ( c, k, s ) => { config = c; knex = k; service = s; },
  to: toLegacy,
  remove: removeLegacy
} );


async function removeLegacy( ae ) {

  const legacyId = await _getLegacyId( ae );

  if ( !legacyId ) return;

  return knex( config.legacy.schemas.agendaEvent ).delete().where( {
    review_id: legacyId.split( '.' )[ 0 ],
    event_id: legacyId.split( '.' )[ 1 ]
  } );

}


async function toLegacy( ae ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  const legacyState = toLegacyState( ae.state ); 

  const data = {
    state: legacyState.state,
    is_published: legacyState.isPublished,
    featured: ae.featured,
    updated_at: new Date
  }

  if ( ae.userUid ) {

    data.user_id = _.get( await knex( config.legacy.schemas.user ).first( 'id' ).where( 'uid', ae.userUid ), 'id' );

  }

  const q = knex( config.legacy.schemas.agendaEvent );

  const legacyId = await _getLegacyId( ae );

  let eventId, agendaId;

  if ( legacyId ) {

    log( 'legacy agenda-event reference found, updating' );

    eventId = legacyId.split( '.' )[ 1 ];
    agendaId = legacyId.split( '.' )[ 0 ];

    q.update( data ).where( {
      event_id: eventId,
      review_id: agendaId
    } );

  } else {

    log( 'legacy agenda-event reference not found, creating' );

    eventId = _.get( await knex( config.legacy.schemas.event ).first( 'id' ).where( 'uid', ae.eventUid ), 'id' );
    agendaId = _.get( await knex( config.legacy.schemas.agenda ).first( 'id' ).where( 'uid', ae.agendaUid ), 'id' );

    q.insert( _.extend( {
      review_id: agendaId,
      event_id: eventId,
      created_at: new Date
    }, data ) );
    
  }

  const hasLegacyEventEditorRef = !!( await knex( config.legacy.schemas.eventEditor ).first( 'event_id' ).where( { event_id: eventId, review_id: agendaId } ) );

  if ( ae.canEdit && !hasLegacyEventEditorRef ) {

    await knex( config.legacy.schemas.eventEditor ).insert( {
      event_id: eventId,
      review_id: agendaId,
      type: 1
    } );

  } else if ( !ae.canEdit && hasLegacyEventEditorRef ) {

    await knex( config.legacy.schemas.eventEditor ).delete().where( {
      event_id: eventId,
      review_id: agendaId
    } );

  }

  return q;

}


async function _getLegacyId( ae ) {

  if ( ae.legacyId ) return ae.legacyId;

  const agendaId = _.get( await knex( config.legacy.schemas.agenda ).first( 'id' ).where( 'uid', ae.agendaUid ), 'id' );

  const eventId = _.get( await knex( config.legacy.schemas.event ).first( 'id' ).where( 'uid', ae.eventUid ), 'id' );

  return _.get( await knex( config.legacy.schemas.agendaEvent ).first( 'id' ).where( {
    event_id: eventId,
    review_id: agendaId
  } ), 'id' ) ? agendaId + '.' + eventId : null;  

}


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
      'u.uid as userUid',
      'ee.event_id as canEdit'
    ] )
    .from( config.legacy.schemas.agendaEvent + ' as ra' )
    .leftJoin( config.legacy.schemas.agenda + ' as a', 'ra.review_id', 'a.id' )
    .leftJoin( config.legacy.schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .leftJoin( config.legacy.schemas.user + ' as u', 'ra.user_id', 'u.id' )
    .leftJoin( config.legacy.schemas.eventEditor + ' as ee', function() {

      this.on( 'ra.event_id', '=', 'ee.event_id' ).andOn( 'ra.review_id', '=', 'ee.review_id' );

    } ).where( where ),

    result = null;

  data.canEdit = !!data.canEdit;

  let current = await service.get.byLegacyId( origin.agendaId, origin.eventId ),

    values = {
      state: getLegacyState( data.state, data.isPublished ),
      featured: data.featured,
      legacyId: data.agendaId + '.' + data.eventId,
      createdAt: data.createdAt,
      userUid: data.userUid,
      canEdit: data.canEdit,
      updatedAt: data.updatedAt
    };

  if ( !data && current ) {

    result = await service.remove.byLegacyId( origin.agendaId, origin.eventId );

    result.operation = 'delete';

  } else if ( data && !current ) {

    result = await service.create( data.agendaUid, data.eventUid, values, _.extend( { protected: false }, options ) );

    result.operation = 'create';

  } else if ( data && ( _.get( options, 'force' ) || ( current.updatedAt < new Date( data.updatedAt  ) ) ) ) {

    result = await service.update( data.agendaUid, data.eventUid, values, _.extend( { protected: false }, options ) );

    result.operation = 'update';

  } else {

    result = { operation: null }

  }


  return result;

}
