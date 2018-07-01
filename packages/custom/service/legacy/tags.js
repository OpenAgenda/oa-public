"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = _.assign( set, {
  parse
} );

async function parse( agendaEventId, fields ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  const parsed = {};

  // match on label
  
  const legacyTags = ( await knex( schemas.agendaTag + ' as at' )
    .select( 'tag' )
    .leftJoin( schemas.agendaEventTag + ' as aet', 'at.id', 'aet.review_tag_id' )
    .where( 'aet.review_article_id', agendaEventId ) ).map( r => r.tag );

  fields.forEach( field => {

    const matchingOptions = field.options.filter( o => legacyTags.includes( _.isObject( o.label ) ? _.get( o.label, 'fr' ) : o.label ) );

    if ( !matchingOptions.length ) return;

    parsed[ field.field ] = matchingOptions.map( o => o.id );

    if ( [ 'select', 'radio' ].includes( field.fieldType ) ) {

      parsed[ field.field ] = _.head( parsed[ field.field ] );

    }

  } );

  return parsed;

}

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