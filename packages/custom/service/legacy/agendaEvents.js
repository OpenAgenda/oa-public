"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = async ( agendaId, eventId, insertIfNotExists = false ) => {

  const { knex } = config;
  const { schemas } = config.legacy;

  const ref = await knex( schemas.agendaEvent ).first( [ 'id', 'category_id' ] ).where( {
    review_id: agendaId,
    event_id: eventId
  } ); 

  if ( ref ) return { id: ref.id, categoryId: ref.category_id };

  if ( !insertIfNotExists ) return { id: null };

  const insertId = _.first( await knex( schemas.agendaEvent ).insert( {
    review_id: agendaId,
    event_id: eventId
  } ) );

  return { id: insertId, categoryId: null };

}