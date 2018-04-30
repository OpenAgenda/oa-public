"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = set;

async function set( agendaEventId, fields, data ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  const legacyTagIds = fields.reduce( ( tagIds, f ) => {

    if ( !data[ f.field ] ) return tagIds;

    return tagIds.concat( [].concat( data[ f.field ] ).map( id => {

      return _.head( f.options.filter( o => o.id === id ).map( o => o.legacyId ) );

    } ).filter( tId => !!tId ) );

  }, [] );

  await knex( schemas.agendaEventTag ).delete().where( {
    review_article_id: agendaEventId
  } );

  let inserts = 0;

  for ( const tagId of legacyTagIds ) {

    await knex( schemas.agendaEventTag ).insert( {
      review_article_id: agendaEventId,
      review_tag_id: tagId,
      updated_at: new Date
    } );

    inserts++;

  }

  return inserts;

}