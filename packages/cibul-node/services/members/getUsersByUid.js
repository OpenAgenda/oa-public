"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUsersByUid' );
const users = require( '../users' )

module.exports = async userUids => {
  log( 'processing', [].concat( userUids ).join( ',' ) );

  return ( await users.find( {
    query: {
      uid: {
        $in: [].concat( userUids )
      }
    }
  } ) ).data.map( d => _.pick( d, ['id', 'uid', 'fullName', 'culture'] ) );
}
