"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const async = require( 'async' );
const getClient = require( './getClient' );
const fs = require( 'fs' );
const log = require( '@openagenda/logs' )( 'file/s3/store' );

module.exports = store;

function store( config, file, options, cb ) {

  const _getClient = getClient.bind( null, config );

  log( 'storing %s', JSON.stringify( file ) )

  if ( !cb ) {

    cb = options;

    options = {};

  }

  if ( _.isArray( file ) ) {

    let urls = [];

    async.eachSeries( file, function( f, ecb ) {

      store( config, f, options, ( err, url ) => {

        if ( err ) return ecb( err );

        urls.push( url );

        ecb();

      } );

    }, err => err ? cb( err ) : cb( null, urls ) );

  } else {

    let params = _.extend( {
      clearOrigin: true,
      bucket: config.bucket
    }, options ? options : {} );

    log( 'storing %s in bucket %s', file, params.bucket );

    _getClient().upload({
      Bucket: params.bucket,
      Key: path.basename(file),
      Body: fs.createReadStream(file),
      ACL: 'public-read'
    }, (err, res) => {
      if (err) {
        return cb('unable to upload: ' + err);
      }

      if (!params.clearOrigin) {
        return cb(null);
      }

      fs.unlink(file, err => {
        if (err) {
          log('error', 'could not delete file ', +file);
        }

        cb(null, res.Location);
      });
    });

  }

}
