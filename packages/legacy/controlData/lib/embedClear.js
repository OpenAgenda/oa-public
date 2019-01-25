"use strict";

const log = require( '@openagenda/logs' )( 'controlData/embedClear' );

module.exports = ( { prefix, redis }, embedUid ) => {

  log( 'clearing embed %s data', embedUid );

  return redis.del( prefix + 'embeds:' + embedUid );

}
