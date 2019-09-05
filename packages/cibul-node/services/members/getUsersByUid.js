"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUsersByUid' );
const users = require( '../users' )

module.exports = async (userUids, userOptions = {}) => {
  log( 'processing', [].concat( userUids ).join( ',' ), userOptions );

  return ( await users.find( {
    query: {
      uid: {
        $in: [].concat( userUids )
      }
    },
    ...userOptions
  } ) ).data/*.map( d => _.pick( d, ['id', 'uid', 'fullName', 'culture'] ) )*/;
}
