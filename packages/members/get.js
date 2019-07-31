"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const cleanGetOptions = require( './lib/cleanGetOptions' );
const { fromDB } = require( './lib/transformDBEntry' );

module.exports = async function( { knex, schema }, identifier, options = {} ) {

  const {
    legacy
  } = cleanGetOptions( options );

  const where = _.isObject( identifier )
    ? _.mapKeys( _.pick( identifier, [ 'userUid', 'agendaUid', 'id' ] ), ( v, k ) => _.snakeCase( k ) )
    : { id: identifier };

  return fromDB( { includeLegacyFields: legacy },
    await knex( schema ).first( [
      'id', 'agenda_uid', 'credential', 'user_uid', 'store', 'deleted_user'
    ].concat( legacy ? [ 'user_id', 'review_id' ] : [] ) ).where( where )
  )

}
