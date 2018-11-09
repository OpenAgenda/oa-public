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

  // get labels that were picked

  const pickedLabels = fields.reduce( ( picked, field ) => {

    const selectedOptionIds = _.get( data, field.field );

    const matchingLabels = field.options
      .filter( o => selectedOptionIds.includes( o.id ) )
      .map( o => o.label )
      .map( label => _.keys( label ).map( lang => label[ lang ] ) );

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

  // retrieve legacy tags matching labels
  
  const matchingLegacyTags = await knex( schemas.agendaTag )
    .select( 'id' )
    .where( 'review_id', agendaId )
    .whereIn( 'tag', pickedLabels );

  await knex( schemas.agendaEventTag ).delete().where( {
    review_article_id: agendaEventId
  } );

  let inserts = 0;

  for ( const { id } of matchingLegacyTags ) {

    await knex( schemas.agendaEventTag ).insert( {
      review_article_id: agendaEventId,
      review_tag_id: id,
      updated_at: new Date
    } );

    inserts++;

  }

  return inserts;

}
