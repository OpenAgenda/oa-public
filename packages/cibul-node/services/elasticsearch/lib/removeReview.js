"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/elasticsearch/removeEvent' );

module.exports = ( { remove, knex } ) => {

  return async identifier => {

    const toRemoveId = _.isObject( identifier ) ?
        await _getLegacyId( knex, identifier )
        : identifier;

    if ( !toRemoveId ) {
      throw new Error( 'could not retrieve legacy event id' );
    }

    return remove( toRemoveId );

  }

}

function _getLegacyId( knex, identifier ) {
  return knex( 'review' ).first( [ 'id' ] ).where(
    _.pick( identifier, [ 'id', 'uid' ] )
  ).then( r => r ? r.id : null );
}
