"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'legacy/tags' );

const config = require( '../config' );

module.exports = _.assign( set, {
  load,
  parse
} );


async function load( agendaEventId ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  return ( await knex( schemas.agendaTag + ' as at' )
    .select( 'tag' )
    .leftJoin( schemas.agendaEventTag + ' as aet', 'at.id', 'aet.review_tag_id' )
    .where( 'aet.review_article_id', agendaEventId ) ).map( r => r.tag );

}

function parse( fields, legacyTags ) {

  const parsed = {};

  fields.forEach( field => {

    const options = _.get( field, 'options', null );

    if ( !_.isArray( options ) ) {

      log( 'warn', 'There are no options defined for field', field );

      return;

    }

    const matchingOptions = options.filter( o => legacyTags.includes( _.isObject( o.label ) ? _.get( o.label, 'fr' ) : o.label ) );

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
