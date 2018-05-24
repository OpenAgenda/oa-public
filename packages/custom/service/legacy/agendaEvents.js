"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = async ( agendaId, eventId ) => {

  const { knex } = config;
  const { schemas } = config.legacy;

  const ref = await knex( schemas.agendaEvent ).first( 'id' ).where( {
    review_id: agendaId,
    event_id: eventId
  } ); 

  if ( ref ) return ref;

  const insertId = _.first( await knex( schemas.agendaEvent ).insert( {
    review_id: agendaId,
    event_id: eventId
  } ) );

  return { id: insertId };

}