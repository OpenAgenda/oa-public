"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUsersByUid' );
const app = require( '../../app' );

module.exports = async userUids => {
  log( 'processing', [].concat( userUids ).join( ',' ) );

  return ( await app.service( '/users' ).find( {
    query: {
      uid: {
        $in: [].concat( userUids )
      }
    }
  } ) ).data.map( d => _.pick( d, [ 'id', 'uid', 'fullName' ] ) );
}
