"use strict";

var log = require( 'logger' )( 'services/file/s3' ),

config = require( '../../config' ),

utils = require( 'utils' ),

s3 = require( 's3' ),

fs = require( 'fs' ),

http = require( 'http' ),

async = require( 'async' );

module.exports = {
  store: store,
  remove: remove,
  transfer: transfer,
  exists: exists
}

function transfer( srcBucket, srcName, dstBucket, dstName, cb ) {

  log( 'transfering %s/%s to %s/%s', srcBucket, srcName, dstBucket, dstName );

  var client = _getClient(), replied = false,

  uploader = client.moveObject({
    CopySource: srcBucket + '/' + srcName,
    Bucket: dstBucket,
    Key: dstName,
    ACL: 'public-read'
  });

  uploader.on( 'error', ( err ) => {

    if ( err ) cb( err );

    replied = true;

  } );
  
  uploader.on( 'end', () => {

    if ( !replied ) cb();

  } );

}

function store( file, options, cb ) {

  log( 'storing %s', JSON.stringify( file ) )

  var params, client, uploader, error;

  if ( !cb ) {

    cb = options;

    options = {};

  }

  if ( utils.isArray( file ) ) {

    async.each( file, function( f, ecb ) {

      store( f, options, ecb );

    }, cb );

  } else {

    params = utils.extend({
      clearOrigin: true,
      bucket: config.aws.bucket
    }, options ? options : {} );

    log( 'storing %s in bucket %s', file, params.bucket );

    client = _getClient();

    uploader = client.uploadFile({
      localFile: file,
      s3Params: {
        Bucket: params.bucket,
        Key: file.split('/').pop(),
        ACL: 'public-read'
      }
    });

    uploader.on( 'error', function( err ) {

      error = err;

      cb( 'unable to upload:' + err );

    });

    uploader.on( 'end', function() {

      if ( !error ) {

        if ( !params.clearOrigin ) {

          cb( null );

        } else {

          fs.unlink( file, function( err ) {

            if ( err ) log( 'error', 'could not delete file %s', file );

            cb( null );

          } );

        }

      }

    });

  }

}


function remove( filename, options, cb ) {

  var client, operation, error, params;

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  params = utils.extend( {
    bucket: config.aws.bucket
  }, options );

  if ( !utils.isArray( filename ) ) {

    filename = [ filename ];

  }

  client = _getClient();

  operation = client.deleteObjects( {
    Bucket: params.bucket,
    Delete: {
      Objects: filename.map( function( f ) {

        return { Key: f };

      })
    }
  } );

  operation.on( 'error',  function( err ) {

    error = err;

    cb( 'unable to remove:' + err );

  } );

  operation.on( 'end', function() { 

    if ( !error ) cb( null );

  } );

}


function exists( filename, cb ) {

  var path;

  if ( filename.indexOf( '//' ) !== -1 ) {

    path = filename.replace( /^http(s|):/, 'http:' );

  } else {

    path = s3.getPublicUrlHttp( config.aws.bucket, filename );

  }

  http.get( path , function( res ) {

    cb( null, res.statusCode == 200 );

  })

  .on( 'error', () => { cb( null ); } );

}


function _getClient() {

 return s3.createClient({
    s3Options: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    }
  });

}