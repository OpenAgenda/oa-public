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

  // get all labels of custom set
  const labels = fields
    .reduce( ( labels, field ) => labels.concat(
      _.flatten(
        field.options.map( o => _.isString( o.label ) // sometimes isn't multilingual
          ? o.label
          : _.keys( o.label ).map( k => o.label[ k ] )
        )
      )
    ), [] );

  // get labels that were picked

  const pickedLabels = fields.reduce( ( picked, field ) => {

    const selectedOptionIds = [].concat( _.get( data, field.field, [] ) );

    const matchingLabels = field.options
      .filter( o => selectedOptionIds.includes( o.id ) )
      .map( o => o.label )
      .map( label => _.isString( label ) // sometimes isn't multilingual
        ? [ label ]
        : _.keys( label ).map( lang => label[ lang ] )
      );

    return picked.concat( _.flatten( matchingLabels ) );

  }, [] );

  // fetch agenda id

  const legacyAgendaEvent = await knex( schemas.agendaEvent )
    .first( 'review_id' )
    .where( 'id', agendaEventId );

  if ( !legacyAgendaEvent ) {

    throw new VError( 'could not retrieve legacy agenda event', agendaEventId );

  }

  const { review_id: agendaId } = legacyAgendaEvent;

  // retrieve legacy tags specific to custom set

  const legacyTags = await knex( schemas.agendaTag )
    .select( [ 'id', 'review_id', 'tag' ] )
    .where( 'review_id', agendaId )
    .whereIn( 'tag', labels );

  const pickedLegacyTags = legacyTags.filter( lt => pickedLabels.includes( lt.tag ) );

  const toBeRemovedLegacyTags = legacyTags.filter( lt => !pickedLabels.includes( lt.tag ) )

  await knex( schemas.agendaEventTag ).delete()
    .where( 'review_article_id', agendaEventId )
    .whereIn( 'review_tag_id', toBeRemovedLegacyTags.map( t => t.id ) );

  let inserts = 0;

  for ( const { id } of pickedLegacyTags ) {

    const current = await knex( schemas.agendaEventTag )
      .first( 'id' )
      .where( {
        review_article_id: agendaEventId,
        review_tag_id: id
      } );

    if ( current ) continue;

    const q = knex( schemas.agendaEventTag ).insert( {
      review_article_id: agendaEventId,
      review_tag_id: id,
      updated_at: new Date
    } );

    const insertResult = await q;

    inserts++;

  }

  return inserts;

}
