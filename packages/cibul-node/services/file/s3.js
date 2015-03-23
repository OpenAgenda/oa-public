"use strict";

var log = require( '../../lib/logger' )( 's3 service' ),

config = require( '../../config' ),

lib = require( '../../lib/lib' ),

s3 = require( 's3' ),

http = require( 'http' ),

async = require( 'async' );

module.exports = {
  store: store,
  remove: remove,
  exists: exists
}

function store( file, options, cb ) {

  var params, client, uploader, error;

  if ( !cb ) {

    cb = options;

    options = {};

  }

  if ( lib.isArray( file ) ) {

    async.each( file, function( f, ecb ) {

      store( f, options, ecb );

    }, cb );

  } else {

    client = _getClient();

    uploader = client.uploadFile({
      localFile: file,
      s3Params: {
        Bucket: config.aws.bucket,
        Key: file.split('/').pop(),
        ACL: 'public-read'
      }
    });

    uploader.on('error', function( err ) {

      error = err;

      cb( 'unable to upload:' + err );

    });

    uploader.on('end', function() {
    
      if ( !error ) cb();

    });

  }

}


function remove( filename, cb ) {

  var client, operation, error;

  if ( !lib.isArray( filename ) ) {

    filename = [ filename ];

  }

  client = _getClient();

  operation = client.deleteObjects( {
    Bucket: config.aws.bucket,
    Delete: {
      Objects: filename.map( function( f ) {

        return { Key: f };

      })
    }
  } );

  operation.on( 'error',  function( err ) {

    error = err;

    cb( 'unable to upload:' + err );

  } );

  operation.on( 'end', cb );

}


function exists( filename, cb ) {

  http.get( s3.getPublicUrlHttp( config.aws.bucket, filename ) , function(res) {

    cb( null, res.statusCode == 200 );

  })

  .on('error', cb );

}


function _getClient() {

 return s3.createClient({
    s3Options: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    }
  });

}