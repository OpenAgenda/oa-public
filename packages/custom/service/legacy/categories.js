"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = _.assign( set, {
  parse
} );

async function parse( categoryId, fields ) {

  if ( !categoryId ) return {};

  const { knex } = config;
  const { schemas } = config.legacy;

  const f = _.head( fields );

  if ( !f ) return {};

  const label = _.get( await knex( schemas.agendaCategory + ' as c' ).first( 'category' ).where( 'id', categoryId ), 'category' );

  if ( !label ) return {};

  const matching = f.options.filter( o => ( _.isObject( o.label ) ? o.label.fr : o.label ) === label );

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

  if ( !chosenOption ) return;

  await knex( schemas.agendaEvent )
    .update( { category_id: chosenOption.legacyId } )
    .where( { id: agendaEventId } );

}