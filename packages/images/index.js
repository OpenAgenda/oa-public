"use strict";

module.exports = processImage;

module.exports.multi = processImageMulti;

module.exports.init = function( cfg ) {

  config = utils.extend( {
    tmpPath: '/var/tmp',
    timeout: 10000,
    maxSize: 12000000,
    logger: false
  }, cfg );

  if ( config.logger ) {

    log = config.logger( 'images' );

  }

};

module.exports.test = {
  _download: _download,
  _loadImageStream: _loadImageStream,
  _crop: _crop,
  _resize: _resize,
  _checkSize: _checkSize
}

var utils = require( 'utils' ),

p = require( './lib/promises' ),

w = p.w,

wn = p.wn,

log = require( 'basic-logger' )( 'images' ),

http = require( 'http' ),

https = require( 'https' ),

fs = require( 'fs' ),

url = require( 'url' ),

config,

gm = require( 'gm' ).subClass( { imageMagick: true } );


/**
 * handle one image input to multiple
 * image output
 */

function processImageMulti( srcOptions, destOptions, cb ) {

  log( 'processing multiple images' );

  var srcParams = utils.extend( {
    url: false,
    path: false
  }, srcOptions ),

  destDefaults = {
    name: false, // required
    clear: false
  };

  ( srcParams.url ? _download( {
    url: srcParams.url
  } ) : w( { path: srcParams.path } ) )

  .then( function( values ) {

    return w.all( destOptions.map( function( options ) {

      return wn.call( processImage, utils.extend( { 
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

  log( 'processing single image' );

  w( utils.extend( {
    url: false,
    path: false, // either url or this is required
    name: false, // required
    format: false,  // if not set, keep original format
    sizeLimits: [ 2000, 10000000 ],
    clear: true // if true, deletes origin file in tmp dir
  }, options ) )

  .then( p.ifl( { url: true }, _download ) )

  .then( p.ifl( { path: false }, p.interrupt( 'image could not be retrieved' ) ) )

  .then( _loadImageStream )

  .then( _checkSize )

  .then( _clearExif )

  .then( p.ifl( { format: true }, _crop ) )

  .then( p.ifl( { format: true }, _resize ) )

  .then( _save )

  .then( p.ife( { clear: true }, _clearOrigin ) )

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


function _checkSize( values ) {

  return w.promise( function( rs, rj ) {

    var imageBytes;

    if ( values.image.data.Filesize.indexOf( 'MB' ) !== -1 ) {

      imageBytes = parseInt( values.image.data.Filesize.replace( /(\.[0-9]+|)MB/, '000000' ), 10 );

    } else {

      imageBytes = parseInt( values.image.data.Filesize.replace( /(\.[0-9]+|)KB/, '000' ), 10 );

    }

    if ( imageBytes < values.sizeLimits[ 0 ] ) {

      return rj( 'image is too small: ' + imageBytes );

    } else if ( imageBytes > values.sizeLimits[ 1 ] ) {

      return rj( 'image is too big: ' + imageBytes );

    }

    rs( values );

  } );

}


function _save( values ) {

  return w.promise( function( rs, rj ) {

    var path = values.path.split( '/' ),

    format = ( values.format && values.format.format ) ? values.format.format : 'jpg',

    dstPath;

    path.pop();

    path.push( _stripExtension( values.name ) );

    dstPath = path.join('/') + '.' + format;

    values.image.write( dstPath, function( err ) {

      if ( err ) return rj( err );

      log( 'successful image save at %s', dstPath );

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

        log( 'download attempt returned a code %s for path %s', req.statusCode, src );

        return rj( 'status code: ' + res.statusCode );

      }

      res.pipe( file );

      res.on( 'data', function( chunk ) {

        downloadedSize += chunk.length;

        if ( downloadedSize > config.maxSize ) {

          _downloadAbort( req, path, 'maximum size exceeded', rj );

          aborted = true;

        }

      });

      res.on( 'end', function() {
        
        if ( aborted ) return;

        values.path = path;

        log( 'download successful at %s', path );

        rs( values );

      });

    });

    req.setTimeout( config.timeout, function() {

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

function _getTemporaryFilePath() {

  return config.tmpFolderPath + ( new Date() ).getTime() + '-' + Math.ceil( Math.random() * 9999999999 );

}

function _stripExtension( filename ) {

  var parts = filename.split( '.' );

  if ( [ 'jpg', 'png', 'bmp', 'jpeg' ].indexOf( parts.pop() ) !== -1 ) {

    return parts.join( '.' );

  }

  return filename;

}