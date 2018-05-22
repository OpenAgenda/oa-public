"use strict";

const _ = require( 'lodash' );
const config = require( '../config' );
const sources = require( './sources' );

module.exports = async identifiers => {

  const {
    knex,
    interfaces
  } = config;

  const object = await interfaces.getObject( identifiers );

  if ( !object ) {

    throw new Error( 'Aggregator linked object not found' );

  }

  const aggregator = await knex( 'aggregator as ag' )
    .first( '*' )
    .where( 'review_id', object.id );

  if ( !aggregator ) return null;

  return {
    object,
    sources: sources( object, aggregator )
  }

}