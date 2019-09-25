"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/elasticsearch/removeEvent' );

module.exports = ( { remove, knex } ) => {
  log('processing');

  return async identifier => {

    const toRemoveId = _.isObject( identifier ) ?
        await _getEventLegacyId( knex, identifier )
        : identifier;

    log('will remove event of legacy id %s from legacy elasticsearch', toRemoveId);

    if ( !toRemoveId ) {
      throw new Error( 'could not retrieve legacy event id' );
    }

    return remove( toRemoveId );

  }

}

function _getEventLegacyId( knex, identifier ) {
  return knex( 'event' ).first( [ 'id' ] ).where(
    _.pick( identifier, [ 'id', 'uid' ] )
  ).then( r => r ? r.id : null );
}
