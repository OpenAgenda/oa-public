"use strict";

var utils = require( '@openagenda/utils' ),

images = require( '@openagenda/images' ),

files = require( '@openagenda/files' ),

w = require( 'when' ),

log = () => {};

module.exports = function( data, svc ) {

  return instanciate( data, false, svc );

};

module.exports.test = {
  _setNewLocationImage,
  _setLocationImage,
  _removeNewLocationImage,
  _removeLocationImage
}

module.exports.init = function( c ) {

  log = c.logger( 'location/instanciate' );

}

module.exports.new = function( data, svc ) {

  return instanciate( data, true, svc );

}

function instanciate( data, isNew, svc ) {

  var instance = utils.extend( {
    setImage: setImage,
    clearImage: clearImage,
    transferImage: transferImage,
    isNew: () => isNew
  }, data );

  return instance;

  function setImage( options, cb ) {

    // if is new, image is stored in with a userUid

    var params = utils.extend( {
      stakeholderId: false, // if image is a suggestion from a stakeholder
      path: false,
      url: false, // either path, or url.
    }, options );

    if ( isNew ) {

      return _setNewLocationImage( {
        userUid: data.userUid,
        path: params.path,
        url: params.url
      }, cb );

    }

    params.uid = data.uid;

    log( 'setting image for location %s', data.uid );

    _setLocationImage( {
      uid: data.uid,
      path: params.path,
      url: params.url,
      stakeholderId: params.stakeholderId
    }, ( err, uploadedPath ) => {

      if ( err ) return cb( err );

      let imageName = uploadedPath.split( '/' ).pop();

      log( 'image successfully set for location %s under name %s', data.uid, imageName );

      _saveImageName( data, uploadedPath, imageName, cb );

    } );

  }


  /**
   * save image name in location
   */
  function _saveImageName( l, uploadedPath, imageName, cb ) {

    svc.set( {
      uid: l.uid,
      image: imageName
    }, err => {

      if ( err ) return cb( err );

      cb( null, uploadedPath, imageName );

    } );

  }


  function clearImage( options, cb ) {

    if ( arguments.length == 1 ) {

      cb = options;
      options = {};

    }

    w( utils.extend( {
      stakeholderId: false, // in case we want to remove an alternative image
      done: false,
      suggestion: false
    }, options ) )

    .then( v => {

      log( 'location %s - clearImage: %s', data.id, v.stakeholderId ? 'suggestion image remove from stakeholder ' + v.stakeholderId : 'suggestion image remove' );

      return v;

    } )

    // if is new, remove new image.
    .then( v => {

      if ( !isNew ) return v;

      v.done = true;

      _removeNewLocationImage( { userUid: data.userUid }, cb )

      return v;

    } )

    .then( v => {

      if ( v.done ) return v;

      _removeLocationImage( {
        uid: data.uid,
        stakeholderId: v.stakeholderId
      }, err => {

        if ( err ) return cb( err );

        data.image = null;

        svc.set( {
          uid: data.uid,
          image: null
        }, cb );

      } );

      v.done = true;

      return v;

    } )

    .done( v => {

      log( 'clearImage done' );

    } );

  }

  function transferImage( cb ) {

    if ( !data.image ) return cb( null );

    if ( data.image.indexOf( 'new' ) == -1 ) return cb( 'image is not new, cannot be transfered' );

    files.s3.exists( data.image, ( err, exists ) => {

      if ( err ) return cb( 'problem checking image existence: ' + err );

      if ( !exists ) return cb( 'image was not found: ' + data.image );

      log( 'image was found and should be transferred %s', data.image );

      files.s3.transfer( _getNewImageNames( data.image ), _getExistingImageNames( data.uid ), ( err ) => {

        if ( err ) return cb( 'transfer error: ' + err );

        log( 'image was transferred to %s', data.image );

        data.image = _getExistingImageNames( data.uid )[ 0 ];

        svc.set( data, cb );

      } );

    } );

  }

}


/**
 * formats image in 3 variants to store them in s3
 */

function _setNewLocationImage( params, cb ) {

  log( 'setting new location image at path %s', params.path );

  w( {
    url: params.url,
    path: params.path,
    name: 'location' + params.userUid + 'new',
    formattedPaths: [],
    uploadedPath: false // main image uploaded path
  } )

  .then( _format )

  .then( _upload )

  .done( v => cb( null, v.uploadedPath ), cb );

}

function _setLocationImage( params, cb ) {

  w( {
    url: params.url,
    path: params.path,
    name: 'location' + params.uid + ( params.stakeholderId ? '.' + params.stakeholderId : '' ),
    formattedPaths: [],
    uploadedPath: false, // main image uploaded path
    stakeholderId: false // suggestion id is set
  } )

  .then( _format )

  .then( _upload )

  .done( v => cb( null, v.uploadedPath ), cb );

}


function _removeNewLocationImage( params, cb ) {

  files.s3.remove( _getNewImageNames( params.userUid ), cb );

}

function _removeLocationImage( params, cb ) {

  files.s3.remove( _getExistingImageNames( params.uid ), cb );

}

function _upload( v ) {

  var d = w.defer();

  files.s3.store( v.formattedPaths, ( err, urls ) => {

    if ( err ) return d.reject( err );

    v.uploadedPath = urls[ 0 ];

    d.resolve( v );

  } );

  return d.promise;

}

function _format( v ) {

  log( 'formatting source file %s', v.path || v.url );

  var d = w.defer();

  images.multi( {
    path: v.path,
    url: v.url
  }, _getFormats( v.name ), ( err, imagePaths ) => {

    if ( err ) return d.reject( err );

    log( 'saved formats at %s', imagePaths.join( ', ' ) );

    v.formattedPaths = imagePaths;

    d.resolve( v );

  } );

  return d.promise;

}

function _getExistingImageNames( uid, stakeholderId ) {

  let name = 'location' + uid + ( stakeholderId ? '.' + stakeholderId : '' );

  return _getFormats( name ).map( f => f.name + '.jpg' );

}

function _getNewImageNames( userUid ) {

  return _getFormats( 'location' + ( userUid + '' ).replace( /location|new\.jpg/g, '' ) + 'new' ).map( f => f.name + '.jpg' );

}

function _getFormats( name ) {

  return [ {
    name: name,
    format: { width: 600 }
  }, {
    name: name + '_o'
  }, {
    name: name + '_sm',
    format: { width: 300 }
  } ]

}
