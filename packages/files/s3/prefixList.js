"use strict";

const getClient = require( './getClient' );

module.exports = ( { accessKeyId, secretAccessKey, bucket }, prefix, startAfter = null, limit = 100 ) => {

  return new Promise( ( rs, rj ) => {

    getClient( { accessKeyId, secretAccessKey } ).listObjectsV2( {
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: limit,
      StartAfter: startAfter
    }, ( err, result ) => {

      if ( err ) return rj( err );

      rs( result.Contents.map( c => c.Key ) );

    } );

  } );

}