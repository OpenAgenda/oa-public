"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const cleanDbEntry = require( './lib/cleanDbEntry' );

module.exports = async function( { knex, schema }, identifier ) {

  const where = _.isObject( identifier )
    ? _.pick( identifier, [ 'user_uid', 'agenda_uid' ] )
    : { id: identifier };

  return cleanDbEntry( await knex( schema ).first( [
    'id', 'agenda_uid', 'credential', 'user_uid'
  ] ).where( where ) );

}
