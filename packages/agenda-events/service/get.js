"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' );

let config, knex;

module.exports = _.extend( get, { 
  init: ( c, k ) => { config = c; knex = k }
} );

async function get( agendaUid, eventUid ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let ref = await knex( config.schemas.agendaEvent )
    .first( [ 'agenda_uid', 'event_uid', 'state', 'featured', 'created_at', 'updated_at' ] )
    .where( {
      'agenda_uid' : agendaUid,
      'event_uid' : eventUid
    } );

  if ( !ref ) return null;

  return validate( _.mapKeys( ref, ( v, k ) => _.camelCase( k ) ) );

}