"use strict";

const prefixList = require( './prefixList' );
const uuid = require( 'uuid/v4' );

module.exports = async ( { accessKeyId, secretAccessKey, bucket } ) => {

  let uniqueUid;

  const _list = prefixList.bind( null, { accessKeyId, secretAccessKey, bucket } );

  while( ( await _list( uniqueUid = uuid().replace( /\-/g, '' ) ) ).length );

  return uniqueUid;

}