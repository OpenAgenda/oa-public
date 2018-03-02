"use strict";

const files = require( '@openagenda/files' ),

  images = require( '@openagenda/images' ),

  logger = require( '@openagenda/basic-logger' ),

  w = require( 'when' );

let config, log;

module.exports = {
  load,
  init,
  clear: files.s3.remove,
  getBucketPath: files.s3.getBucketPath
}


function load( options, cb = null ) {

  const p = w( Object.assign( {
    path: false,
    url: false,
    formats: []
  }, options, {
    // internal stuff
    formattedPaths: [],
    uploadedPaths: []
  } ) )

  .then( _format )

  .then( _upload )

  .then( _cleanResult );

  if ( cb ) {

    p.done( result => {

      setTimeout( () => cb( null, result ), 0 );
      
    } );

    p.catch( cb );

  } else {

    return p;

  }

}


function init( c ) {

  config = c;

  if ( c.logger ) {

    logger.setLogger( config.logger );

  }

  log = logger( 'image-files' );

  files.init( Object.assign( {}, c.files, { logger } ) );

  images.init( { 
    tmpPath: config.files.tmpPath, 
    logger 
  } );

}


function _cleanResult( v ) {

  return { uploadedPaths: v.uploadedPaths }

}


function _format( v ) {

  log( 'formatting source file %s', v.path || v.url );

  let d = w.defer();

  images.multi( {
    path: v.path,
    url: v.url
  }, v.formats, ( err, imagePaths ) => {

    if ( err ) return d.reject( err );

    log( 'formatted images successfully generated' );

    v.formattedPaths = imagePaths;

    d.resolve( v );

  } );

  return d.promise;

}


function _upload( v ) {

  log( 'upload' );

  var d = w.defer();

  files.s3.store( v.formattedPaths, ( err, urls ) => {

    if ( err ) return d.reject( err );

    log( 'successfully uploaded %s images', urls.length );

    v.uploadedPaths = urls;

    d.resolve( v );

  } );

  return d.promise;

}