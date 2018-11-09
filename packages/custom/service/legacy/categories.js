"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = _.assign( set, {
  parse,
  load
} );

async function load( categoryId ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  return _.get( await knex( schemas.agendaCategory + ' as c' ).first( 'category' ).where( 'id', categoryId ), 'category' );

}

function parse( fields, categoryLabel ) {

  if ( !categoryLabel ) return {};

  const f = _.head( fields );

  if ( !f ) return {};

  if ( !categoryLabel ) return {};

  const matching = f.options.filter( o => ( _.isObject( o.label ) ? o.label.fr : o.label ) === categoryLabel );

  if ( !matching.length ) return {};

  return _.set( {}, f.field, matching[ 0 ].id );

}

async function set( agendaEventId, fields, data ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  const f = _.head( fields );

  if ( !f ) return;

  const id = _.get( data, f.field );

  const chosenOption = _.head( f.options.filter( o => o.id === id ) );

  const chosenOptionLabels = chosenOption ? 
    _.keys( chosenOption.label ).map( lang => chosenOption.label[ lang ] )
    : [];

  let legacyId = null;
  
  if ( chosenOptionLabels.length ) {

    // fetch agenda id

    const legacyAgendaEvent = await knex( schemas.agendaEvent )
      .first( 'review_id' )
      .where( 'id', agendaEventId );

    if ( !legacyAgendaEvent ) {

      throw new VError( 'could not retrieve legacy agenda event', agendaEventId );

    }

    const { review_id: agendaId } = legacyAgendaEvent;

    const matchingCategory = await knex( schemas.agendaCategory )
      .first( 'id' )
      .where( 'review_id', agendaId )
      .whereIn( 'category', chosenOptionLabels );

    if ( matchingCategory ) legacyId = matchingCategory.id;

  }

  await knex( schemas.agendaEvent )
    .update( { category_id: legacyId } )
    .where( { id: agendaEventId } );

}
