"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const cleanGetOptions = require( './lib/cleanGetOptions' );
const { fromDB } = require( './lib/transformDBEntry' );

module.exports = Object.assign( get, {
  byEmail: getByEmail
} );

async function get( config, identifier, options = {} ) {
  const {
    query,
    options: cleanOptions
  } = _getQueryAndOptions( config, identifier, options );

  return fromDB( { includeLegacyFields: cleanOptions.legacy }, await query );
}

async function getByEmail( config, identifier, options = {} ) {
  if ( !_.isObject( identifier ) ) {
    throw new Error( 'Bad request: identifier must be an object containing at least an email and another identifier' );
  } else if ( !identifier.email ) {
    throw new Error( 'Bad request: email is missing in identifier' );
  };

  const {
    query,
    options: cleanOptions
  } = await _getQueryAndOptions( config, identifier, options );

  const member = fromDB( {
    includeLegacyFields: cleanOptions.legacy
  }, await query.where( 'store', 'like', `%${identifier.email}%` ) );

  if ( member ) return member;

  if ( _.get( config, 'interfaces.getUserUidByEmail' ) ) {
    const userUid = await config.interfaces.getUserUidByEmail( identifier.email );

    return userUid
      ? get( config, Object.assign( {}, identifier, { userUid } ), options )
      : null;
  }

  return null;
}

function _getQueryAndOptions( { knex, schema }, identifier, options = {} ) {
  const {
    legacy
  } = cleanGetOptions( options );

  const where = _.isObject( identifier )
    ? _.mapKeys( _.pick( identifier, [ 'userUid', 'agendaUid', 'id' ] ), ( v, k ) => _.snakeCase( k ) )
    : { id: identifier };

  return {
    query: knex( schema ).first( [
      'id', 'agenda_uid', 'credential', 'user_uid', 'store', 'deleted_user'
    ].concat( legacy ? [ 'user_id', 'review_id' ] : [] ) ).where( where ),
    options: {
      legacy
    }
  }
}
