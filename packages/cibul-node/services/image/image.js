"use strict";

module.exports = processImage;

module.exports.multi = processImageMulti;

module.exports.test = {
  _download: _download,
  _loadImageStream: _loadImageStream,
  _crop: _crop,
  _resize: _resize,
  _setConfig: _setConfig
}

var lib = require( '../../lib/lib' ),

p = require( '../../lib/promises' ),

w = p.w,

wn = p.wn,

log = require( '../../lib/logger' )( 'image service' ),

config = require( '../../config' ),

http = require( 'http' ),

https = require( 'https' ),

fs = require( 'fs' ),

url = require( 'url' ),

gm = require( 'gm' ).subClass( { imageMagick: true } ),

cfg = {
  requestTimeout: 10000,
  maxSize: 12000000
};


/**
 * handle one image input to multiple
 * image output
 */

function processImageMulti( srcOptions, destOptions, cb ) {

  var srcParams = lib.extend( {
    url: false,
    path: false
  }, srcOptions ),

  destDefaults = {
    name: false, // required
    clear: false
  };

  _download( {
    url: srcParams.url
  } )

  .then( function( values ) {

    return w.all( destOptions.map( function( options ) {

      return wn.call( processImage, lib.extend( { 
        path: values.path,
        clear: false,
        name: false
      }, options ) );

    } ) )

    .then( function( paths ) {

      values.paths = paths;

      return values;

    });

  } )

  .then( _clearOrigin )

  .done( function( values ) {

    cb( null, values.paths );

  }, cb );

}


/**
 * handle one image from url fetch or src file 
 * to tmp formatted saved image
 */

function processImage( options, cb ) {

  w( lib.extend( {
    url: false,
    path: false, // either url or this is required
    name: false, // required
    format: false,  // if not set, keep original format
    clear: true // if true, deletes origin file in tmp dir
  }, options ) )

  .then( p.ifLoaded( 'url', true, _download ) )

  .then( p.ifLoaded( 'path', false, p.interrupt( 'image could not be retrieved' ) ) )

  .then( _loadImageStream )

  .then( _clearExif )

  .then( p.ifLoaded( 'format', true, _crop ) )

  .then( p.ifLoaded( 'format', true, _resize ) )

  .then( _save )

  .then( p.ifIs( 'clear', true, _clearOrigin ) )

  .done( function( values ) {

    cb( null, values.dstPath );

  }, cb );

}


function _clearOrigin( values ) {

  return w.promise( function( rs, rj ) {

    log( 'removing file at %s', values.path );

    fs.unlink( values.path, function( err ) {

      if ( err ) {

        log( 'error', 'could not delete file at %s', values.path );

        return rj( err );

      }

      rs( values );

    });

  });

}


function _clearExif( values ) {

  values.image.noProfile();

  return values;

}


function _save( values ) {

  return w.promise( function( rs, rj ) {

    var path = values.path.split( '/' ),

    format = ( values.format && values.format.format ) ? values.format.format : 'jpg',

    dstPath;

    path.pop();

    path.push( values.name );

    dstPath = path.join('/') + '.' + format;

    values.image.write( dstPath, function( err ) {

      if ( err ) return rj( err );

      values.dstPath = dstPath;

      rs( values );

    })

  });

}



/**
 * resize to fit inside required format
 */

function _resize( values ) {

  if ( !values.format.width && !values.format.height ) return values;

  return w.promise( function( rs, rj ) {

    var resizeByHeight = false,

    srcRatio = values.info.size.width / values.info.size.height,

    dstRatio = ( !values.format.width || !values.format.height ) ? srcRatio : values.format.width / values.format.height,

    resizeRatio;

    if ( srcRatio !== dstRatio ) {

      resizeByHeight = dstRatio > srcRatio;

    }

    resizeRatio = values.format[ resizeByHeight ? 'height' : 'width' ] / values.info.size[ resizeByHeight ? 'height' : 'width' ];

    values.info.size.width = values.info.size.width * resizeRatio;

    values.info.size.height = values.info.size.height * resizeRatio;

    values.image.resize( values.info.size.width, values.info.size.height );

    rs( values );

  });

}


/**
 * crop image if required
 */

function _crop( values ) {

  if ( !values.format.crop || !values.format.height || !values.format.width ) return values;

  return w.promise( function( rs, rj ) {

    // crop if ratio is different
    
    var srcRatio = values.info.size.width / values.info.size.height,

    dstRatio = values.format.width / values.format.height,

    newHeight, newWidth;

    if ( srcRatio < dstRatio ) {

      // crop in height

      newHeight = values.info.size.width / dstRatio;

      values.image.crop( values.info.size.width, newHeight, 0, ( values.info.size.height - newHeight )/2 );

      values.info.size.height = newHeight;

    } else {

      // crop in width
      
      newWidth = values.info.size.height * dstRatio;

      values.image.crop( newWidth, values.info.size.height, ( values.info.size.width - newWidth ) / 2, 0 );

      values.info.size.width = newWidth;

    }

    rs( values );

  });

}

/**
 * load and check image validity
 */

function _loadImageStream( values ) {

  return w.promise( function( rs, rj ) {

    var image = gm( values.path );

    image.identify( function( err, info ) {

      if ( err ) {

        log( 'error', 'invalid image: %s', err );

        rj( 'invalid image' );

        return;

      }

      values.info = info;

      values.image = image;

      rs( values );

    });


  });

}


/**
 * download file from given url
 */

function _download( values ) {

  return w.promise( function( rs, rj ) {

    var path = _getTemporaryFilePath(),

    src = values.url,

    timeout = false,

    file = fs.createWriteStream( path ),

    downloadedSize = 0,

    aborted = false,

    req = ( src.match( /^https:/ ) ? https : http )

    .get( src, function( res ) {

      if ( res.statusCode != 200 ) {

        return cb( 'status code: ' + res.statusCode );

      }

      res.pipe( file );

      res.on( 'data', function( chunk ) {

        downloadedSize += chunk.length;

        if ( downloadedSize > cfg.maxSize ) {

          _downloadAbort( req, path, 'maximum size exceeded', rj );

          aborted = true;

        }

      });

      res.on( 'end', function() {
        
        if ( aborted ) return;

        values.path = path;

        rs( values );

      });

    });

    req.setTimeout( cfg.requestTimeout, function() {

      _downloadAbort( req, path, 'timeout', rj );

      aborted = true;

    });

    req.on( 'error', function( err ) {

      log( 'error', 'request error: %s', err );

    } );

  } );

}


function _downloadAbort( req, path, errorMessage, cb ) {

  req.abort();

  fs.unlink( path, function( err ) {

    if ( err ) {

      log( 'error', 'could not delete file at %s', path );

    }

    cb( errorMessage );

  });

}


function _setConfig( values ) {

  lib.extend( cfg, values );

}

function _getTemporaryFilePath() {

  return config.tmpFolderPath + ( new Date() ).getTime() + '-' + Math.ceil( Math.random() * 9999999999 );

}