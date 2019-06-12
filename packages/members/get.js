"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const cleanDbEntry = require( './lib/cleanDbEntry' );

module.exports = async function( { knex, schema }, identifier ) {

  const where = _.isObject( identifier )
    ? _.mapKeys( _.pick( identifier, [ 'userUid', 'agendaUid' ] ), ( v, k ) => _.snakeCase( k ) )
    : { id: identifier };

  return cleanDbEntry( { includeLegacyFields: false },
    await knex( schema ).first( [
      'id', 'agenda_uid', 'credential', 'user_uid'
    ] ).where( where )
  )

}
