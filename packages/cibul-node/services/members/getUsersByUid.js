"use strict";

const _ = require( 'lodash' );
const users = require( '@openagenda/users' );

const log = require( '@openagenda/logs' )( 'services/members/getUsersByUid' );

module.exports = async userUids => {
  log( 'processing', [].concat( userUids ).join( ',' ) );

  return ( await users.find( {
    query: {
      uid: {
        $in: [].concat( userUids )
      }
    }
  } ) ).data.map( d => _.pick( d, [ 'id', 'uid', 'fullName' ] ) );
}
