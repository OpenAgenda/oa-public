"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const generateUniquePrefix = require( './generateUniquePrefix' );
const getClient = require( './getClient' );
const http = require( 'http' );
const log = require( '@openagenda/logs' )( 'file/s3' );
const prefixList = require( './prefixList' );
const store = require( './store' );


let config, _getClient, _prefixList, _store;

module.exports = {
  init: cfg => {

    config = cfg;

    _getClient = getClient.knox.bind( null, config );

    _prefixList = prefixList.bind( null, config );

    _store = store.bind( null, config );

  },
  store: ( file, options, cb ) => {

    _store( file, options, cb );

  },
  remove,
  transfer,
  generateUniquePrefix: () => generateUniquePrefix.bind( null, config )(),
  copy,
  exists,
  getBucketPath
}


function getBucketPath( bucket ) {

  return `https://${bucket || config.bucket}.s3.amazonaws.com/`;

}


function copy( srcBucket, srcName, dstBucket, dstName, cb ) {

  if ( arguments.length == 3 ) {

    srcName = arguments[ 0 ];

    dstName = arguments[ 1 ];

    srcBucket = dstBucket = config.bucket;

    cb = arguments[ 2 ];

  }

  if ( _.isArray( srcName ) ) {

    return async.eachSeries( srcName.map( ( s, i ) => [ s, dstName[ i ] ] ), ( namePair, ecb ) => {

      copy( srcBucket, namePair[ 0 ], dstBucket, namePair[ 1 ], ecb );

    }, cb );

  }

  log( 'copying file %s/%s to %s/%s', srcBucket, srcName, dstBucket, dstName );

  _getClient( srcBucket ).copyFileTo( '/' + srcName, dstBucket, '/' + dstName, {
    'x-amz-acl': 'public-read'
  }, ( err, res ) => {

    if ( err ) return cb( 'copy not successful: %s', err );

    if ( res.statusCode !== 200 ) return cb( 'copy was not successful: %s', res.statusCode );

    cb( null );

  } );

}


function transfer( srcBucket, srcName, dstBucket, dstName, cb ) {

  if ( arguments.length == 3 ) {

    srcName = arguments[ 0 ];

    dstName = arguments[ 1 ];

    srcBucket = dstBucket = config.bucket;

    cb = arguments[ 2 ];

  }

  if ( _.isArray( srcName ) ) {

    return async.eachSeries( srcName.map( ( s, i ) => [ s, dstName[ i ] ] ), ( namePair, ecb ) => {

      transfer( srcBucket, namePair[ 0 ], dstBucket, namePair[ 1 ], ecb );

    }, cb );

  }

  log( 'transfering %s/%s to %s/%s', srcBucket, srcName, dstBucket, dstName );

  copy( srcBucket, srcName, dstBucket, dstName, err => {

    if ( err ) return cb( 'transfer not successful: %s', err );

    remove( srcName, { bucket: srcBucket }, err => {

      if ( err ) return cb( 'could not remove origin file after copy: %s', err );

      cb( null );

    } );

  } );

}

function remove( filename, options, cb ) {

  let operation, error, params;

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  params = _.extend( {
    bucket: config.bucket
  }, options );

  if ( !_.isArray( filename ) ) {

    filename = [ filename ];

  }

  _getClient( params.bucket ).deleteMultiple( filename.map( f => '/' + f ), ( err, res ) => {

    if ( err ) return cb( 'unable to remove: %s', err );

    cb( null );

  } );

}


function exists( filename, cb ) {

  let path;

  if ( filename.indexOf( '//' ) !== -1 ) {

    path = filename.replace( /^http(s|):/, 'http:' );

  } else {

    path = _getClient( config.bucket ).http( '/' + filename );

  }

  http.get( path , function( res ) {

    cb( null, res.statusCode == 200 );

  } )

  .on( 'error', () => { cb( null ); } );

}
