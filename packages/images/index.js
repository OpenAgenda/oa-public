"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const gm = require( 'gm' ).subClass( { imageMagick: true } );
const http = require( 'http' );
const https = require( 'https' );
const { promisify } = require( 'util' );
const request = require( 'request' );
const url = require( 'url' );
const VError = require( 'verror' );

const logger = require( '@openagenda/logs' );
const log = require( '@openagenda/logs' )( 'images' );

const p = require( './lib/promises' );
const { w, wn } = p;

let config;

module.exports = _.assign( processImage, {
  multi: processImageMulti,
  init,
  test: {
    _download,
    _loadImageStream,
    _crop,
    _resize,
    _checkSize
  }
} );

function init( cfg ) {

  config = _.extend( {
    tmpPath: '/var/tmp',
    timeout: 10000,
    maxSize: 12000000,
    logger: false
  }, cfg );

  if ( config.logger ) {

    logger.setModuleConfig( config.logger );

  }

};


/**
 * handle one image input to multiple
 * image output
 */

function processImageMulti( srcOptions, destOptions, cb ) {

  log( 'processing multiple images' );

  var srcParams = _.extend( {
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

  .then( async values => {

    const paths = [];
    const infos = [];

    for ( const options of destOptions ) {

      const { dstPath, info } = await promisify( processImage )( _.assign( { 
        path: values.path,
        clear: false,
        name: false
      }, options, {
        returnValues: true
      } ) );

      paths.push( dstPath );
      infos.push( info );

    }

    return _.assign( values, {
      paths,
      infos
    } );

  } )

  .then( _clearOrigin )

  .done( values => {

    cb( null, values.paths, values.infos );

  }, cb );

}


/**
 * handle one image from url fetch or src file 
 * to tmp formatted saved image
 */

function processImage( options, cb ) {

  log( 'processing single image' );

  w( _.extend( {
    preSave: false,
    url: false,
    path: false, // either url or this is required
    name: false, // required
    format: false,  // if not set, keep original format
    sizeLimits: [ 2000, 10000000 ],
    info: {},
    returnValues: false,
    clear: true // if true, deletes origin file in tmp dir
  }, options ) )

  .then( p.ifl( { url: true }, _download ) )

  .then( p.ifl( { path: false }, p.interrupt( 'image could not be retrieved' ) ) )

  .then( _loadImageStream )

  .then( _checkSize )

  .then( _clearExif )

  .then( p.ife( { preSave: true }, _preSave ) )

  .then( p.ifl( { format: true }, _crop ) )

  .then( p.ifl( { format: true }, _resize ) )

  .then( _save )

  .then( p.ife( { clear: true }, _clearOrigin ) )

  .done( function( values ) {

    cb( null, values.returnValues ? values : values.dstPath );

  }, cb );

}


async function _clearOrigin( values ) {

  log( 'removing file at %s', values.path );

  try {

    await promisify( fs.unlink.bind( fs ) )( values.path );

  } catch ( err ) {

    log( 'error', 'could not delete file at %s', values.path );

    throw err;

  }

  return values;

}


function _clearExif( values ) {

  values.image.noProfile();

  return values;

}


function _checkSize( values ) {

  return w.promise( function( rs, rj ) {

    var imageBytes;

    const { filesize } = values.info;

    if ( filesize.indexOf( 'MB' ) !== -1 ) {

      imageBytes = parseInt( filesize.replace( /(\.[0-9]+|)MB/, '000000' ), 10 );

    } else if ( filesize.indexOf( 'KB' ) !== -1 ) {

      imageBytes = parseInt( filesize.replace( /(\.[0-9]+|)KB/, '000' ), 10 );

    } else {

      imageBytes = parseInt( filesize.replace( /(\.[0-9]+|)B/, '' ), 10 );

    }

    if ( imageBytes < values.sizeLimits[ 0 ] ) {

      return rj( 'image is too small: ' + imageBytes );

    } else if ( imageBytes > values.sizeLimits[ 1 ] ) {

      return rj( 'image is too big: ' + imageBytes );

    }

    rs( values );

  } );

}


async function _preSave( values ) {

  const path = values.path.split( '/' );

  const format = ( values.format && values.format.format ) ? values.format.format : 'jpg';

  log( 'presaving to format', format );

  path.pop();

  path.push( _stripExtension( values.name ) );

  const dstPath = path.join('/') + '.pre.' + format;

  log( 'presaving to %s', dstPath );

  await promisify( values.image.write.bind( values.image ) )( dstPath );

  log( 'presaved' );

  // reload image from pre-saved
  if ( values.clear ) await _clearOrigin( values );

  _.assign( values, {
    path: dstPath,
    clear: true
  } );

  return _loadImageStream( values );

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

    values.info.size.width = Math.ceil( values.info.size.width * resizeRatio );

    values.info.size.height = Math.ceil( values.info.size.height * resizeRatio );

    values.image.resize( values.info.size.width, values.info.size.height );

    rs( values );

  });

}


/**
 * crop image if required
 */

function _crop( values ) {

  if ( !values.format.crop || !values.format.height || !values.format.width ) return values;

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

    } else if ( srcRatio > dstRatio ) {

      // crop in width
      
      newWidth = values.info.size.height * dstRatio;

      values.image.crop( newWidth, values.info.size.height, ( values.info.size.width - newWidth ) / 2, 0 );

      values.info.size.width = newWidth;

    } else {

      log( 'the ratio is the same, no need to crop' );

    }

    rs( values );

  });

}

/**
 * load and check image validity
 */

async function _loadImageStream( values ) {

  log( 'loading image stream' );

  const image = gm( values.path );

  try {

    const size = await promisify( image.size.bind( image ) )();
  
    const filesize = await promisify( image.filesize.bind( image ) )();

    values.info = {
      size,
      filesize
    };

    values.image = image;

    return values;

  } catch ( err ) {

    log( 'error', 'invalid image: %j', err );

    throw 'invalid image';

  }

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

    req = request.get( {
      url: src,
      agentOptions: {
        rejectUnauthorized: false
      },
      timeout: config.timeout
    } )

    .on( 'error', err => {

      rj( err.code == 'ETIMEDOUT' ? 'timeout' : err );

    } )

    .on( 'data', chunk => {

      downloadedSize += chunk.length;

      if ( downloadedSize > config.maxSize ) {

        _downloadAbort( req, path, 'maximum size exceeded', rj );

        aborted = true;

      }

    } )

    .on( 'end', () => {

      if ( aborted ) return;

      values.path = path;

      log( 'download successful at %s', path );

    });

    req.pipe( file );

    file.on( 'close', () => {

      if ( aborted ) return;

      rs( values );

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

  return config.tmpPath + ( new Date() ).getTime() + '-' + Math.ceil( Math.random() * 9999999999 );

}

function _stripExtension( filename ) {

  var parts = filename.split( '.' );

  if ( [ 'jpg', 'png', 'bmp', 'jpeg' ].indexOf( parts.pop() ) !== -1 ) {

    return parts.join( '.' );

  }

  return filename;

}
