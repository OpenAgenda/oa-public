"use strict";

const _ = require( 'lodash' );

const users = require( '@openagenda/users' );

const exposed = [
  'uid',
  'fullName'
];

module.exports = async userUids => {

  return ( await users.find( {
    query: {
      uid: {
        $in: userUids
      }
    }
  } ) ).data.map( d => _.pick( d, exposed ) );

}
