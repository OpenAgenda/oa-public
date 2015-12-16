"use strict";

var utils = require( 'utils' ),

w = require( 'when' ),

config = require( '../../../config' ),

imageSvc = require( 'images' ),

s3Svc = require( 'files' ).s3,

log = require( 'logger' )( 'services/event/instance/custom' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  var customFields, agendaUid;

  return {
    loadAgendaCustomContext: loadAgendaCustomContext,
    setCustomImage: setCustomImage,
    saveCustomImage: saveCustomImage,
    unsetCustomImage: unsetCustomImage
  }

  function saveCustomImage( options, cb ) {

    log( 'saveCustomImage with %s', JSON.stringify( options ) );

    var params = utils.extend( {
      name: false, // required
      userUid: false // required
    }, options );

    if ( !agendaUid ) return cb( 'agenda context missing' );

    w( utils.extend( {
      instance: instance,
      agendaUid: agendaUid
    }, params ) )

    .then( _checkSourceExistence )

    .then( _transferImageToPermanent )

    .then( _updateFieldValue )

    .done( ( v ) => {

      log( 'saved image at %s', v.destUrl );

      cb( null, v.destUrl );

    }, ( err ) => {

      log( err );

      cb( err );

    } );

  }

  

  function loadAgendaCustomContext( ctxt ) {

    agendaUid = ctxt.uid;
    
    customFields = ctxt.customFields;

  }

  function unsetCustomImage( options, cb ) {

    var params = utils.extend( {
      name: false, // required
      userUid: false // required 
    }, options );

    w( utils.extend( {
      instance: instance,
      agendaUid: agendaUid,
      customFields: customFields,
      bucket: false,
      filename: false
    }, params ) )

    .then( _setDestFileName )

    .then( _checkDestExistence )

    .then( _remove )

    .then( _clearFieldValue )

    .done( ( v ) => {

      log( 'image set at %s', v.destUrl );

      cb( null, v.destUrl );

    }, ( err ) => {

      log( 'error', err );

      cb( err );

    } );

  }

  function setCustomImage( options, cb ) {

    var params = utils.extend( {
      name: false, // required
      path: false, // required
      userUid: false, // required if new event
    }, options );

    w( utils.extend( {
      instance: instance,
      agendaUid: agendaUid,
      customFields: customFields,
      processedPath: false,           // processed image local path
      bucket: false,                  // destination bucket
      destUrl: false,                    // destination url
      filename: false,
      destPath: false,
      format: {}
    }, params ) )

    .then( _setDestFileName )

    .then( _extractProcessConfig )

    .then( _processImage )

    .then( _upload )

    .done( ( v ) => {

      log( 'image set at %s', v.destUrl );

      cb( null, v.destUrl );

    }, ( err ) => {

      log( 'error', err );

      cb( err );

    } );

  }

});



function _remove( v ) {

  return w.promise( ( rs, rj ) => {

    log( 'removing image %s from bucket %s', v.filename, v.bucket );

    s3Svc.remove( v.filename, { bucket: v.bucket }, ( err ) => {

      if ( err ) return rj( err );

      log( 'image removed' );

      rs( v );

    } );

  } );

}


function _updateFieldValue( v ) {

  return w.promise( ( rs, rj ) => {

    v.instance.setCustomField( v.name, v.savedName, true, ( err ) => {

      if ( err ) return rj( err );

      rs( v );

    } );

  } );

}


function _clearFieldValue( v ) {

  if ( v.instance.isNew() ) {

    return v;

  }

  return w.promise( ( rs, rj ) => {

    v.instance.setCustomField( v.name, null, true, ( err ) => {

      if ( err ) return rj( err );

      rs( v );

    } );

  } );

}


function _transferImageToPermanent( v ) {

  return w.promise( ( rs, rj ) => {

    var tmp = _newImagePathname( v ),

    pmnt = _existingImagePathname( v );

    s3Svc.transfer( tmp.bucket, tmp.name, pmnt.bucket, pmnt.name, ( err ) => {

      if ( err ) return rj( err );

      v.destUrl = pmnt.url;

      v.savedName = pmnt.name;

      rs( v );

    } );

  })

}

function _checkSourceExistence( v ) {

  log( 'checking source image existence' );

  return _checkExistence( v, _newImagePathname( v ).url );

}

function _checkDestExistence( v ) {

  log( 'check image existence' );

  var url = ( v.instance.isNew() ? _newImagePathname( v ) : _existingImagePathname( v ) ).url

  return _checkExistence( v, url );

}

function _checkExistence( v, url ) {

  return w.promise( ( rs, rj ) => {

    log( 'source should be here: %s', url );

    s3Svc.exists( url, ( err, exists ) => {

      if ( err ) return rj( err );

      if ( !exists ) return rj( 'source image does not exist: ' + url );

      rs( v );

    } );

  });

}


function _upload( v ) {

  log( 'uploading %s to bucket %s', v.processedPath, v.bucket );

  return w.promise( ( rs, rj ) => {

    s3Svc.store( v.processedPath, {
      bucket: v.bucket,
      clearOrigin: true
    }, ( err ) => {

      if ( err ) return rj( err );

      log( 'upload successful' );

      rs( v );

    } );

  } );

}


function _processImage( v ) {

  return w.promise( ( rs, rj ) => {

    imageSvc( {
      name: v.filename,
      path: v.path,
      format: v.format
    }, ( err, path ) => {

      if ( err ) return rj( err );

      v.processedPath = path;

      rs( v );

    } );

  });

}


function _extractProcessConfig( v ) {

  var field = v.customFields.filter( ( f ) => { return f.name == v.name; } );

  field = field.length ? field[ 0 ] : false;

  if ( !field ) {

    throw 'field config not found';

  }

  [ 'crop', 'width', 'height' ].forEach( ( f ) => {

    if ( field[ f ] ) v.format[ f ] = field[ f ];

  } );

  log( 'processing configuration set to %s', JSON.stringify( v.format ) );

  return v;
  
}


function _setDestFileName( v ) {

  var isNew = v.instance.isNew();

  if ( isNew ) {

    log( 'event is new' );

    if ( !v.userUid ) throw 'user uid is required';

  } else {

    log( 'event is existing' );

  }

  var i = ( v.instance.isNew() ? _newImagePathname : _existingImagePathname )( v );

  v.bucket = i.bucket;

  v.filename = i.name;

  v.destUrl = i.url;

  log( 'bucket set to %s', v.bucket );

  log( 'dest file name set to %s', v.filename );

  log( 'destination url will be %s', v.destUrl );

  return v;

}

function _newImagePathname( v ) {

  var name = [ v.agendaUid, v.userUid, v.name, 'jpg' ].join( '.' );

  return {
    bucket: config.aws.tmpBucket,
    name: name,
    url: config.aws.tmpBucketPath + name
  }

}

function _existingImagePathname( v ) {

  var name = [ v.agendaUid, v.instance.uid, v.name, 'jpg' ].join( '.' );

  return {
    bucket: config.aws.bucket,
    name: name,
    url: config.aws.imageBucketPath + name
  }

}