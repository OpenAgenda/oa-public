"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

module.exports = set;

async function set( agendaEventId, fields, data ) {

  const { knex } = config;
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