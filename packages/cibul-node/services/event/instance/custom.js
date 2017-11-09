"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const config = require( '../../../config' );
const imageSvc = require( '@openagenda/images' );
const log = require( 'logs' )( 'services/event/instance/custom' );
const s3Svc = require( '@openagenda/files' ).s3;
const w = require( 'when' );


module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  var customFields, agendaUid;

  return {
    loadAgendaCustomContext,
    setCustomFile,
    unsetCustomFile,
    evaluateCustomImageDuplication
  }

  function evaluateCustomImageDuplication( cb ) {

    async.eachSeries( customFields.filter( f => f.fieldType === 'image' ), ( field, ecb ) => {

      /*
       
      { name: 'illustration',
        fieldType: 'image',
        type: 'public',
        optional: true,
        label: { fr: 'Photo d\'illustration', en: 'Partner illustration' },
        info: 
         { fr: 'Chargez l\'illustration utilisée sur le champ précédent',
           en: 'Load the image used in the previous field' } } 
       */

      instance.getCustomField( field.name, ( err, value ) => {

        if ( err || !value ) return ecb( err );

        let customImageEventUid = parseInt( value.split( '.' )[ 1 ] );

        if ( customImageEventUid === instance.uid ) {

          return ecb();

        }

        let src = getFilePathData( agendaUid, customImageEventUid, field.name, 'image' );

        let dst = getFilePathData( agendaUid, instance.uid, field.name, 'image' );

        // if the custom image name does not contain the uid of the current event
        // we have a duplicated event, we need to duplicate the image as well.

        s3Svc.copy( src.bucket, src.name, dst.bucket, dst.name, err => {

          if ( err ) return ecb( err );

          instance.setCustomField( field.name, dst.name, true, ecb );

        } );

      } );

    }, cb );

  }
  

  function loadAgendaCustomContext( ctxt ) {

    agendaUid = ctxt.uid;
    
    customFields = ctxt.customFields;

  }

  function unsetCustomFile( options, cb ) {

    var params = _.extend( {
      type: 'image',
      name: false, // required
      fileKey: false // required 
    }, options );

    w( _.extend( {
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

  function setCustomFile( options, cb ) {

    var params = _.extend( {
      type: 'image',
      name: false, // required
      path: false, // required
      fileKey: false, // required
    }, options );

    w( _.extend( {
      instance: instance,
      agendaUid: agendaUid,
      customFields: customFields,
      processedPath: false,           // processed file local path
      bucket: false,                  // destination bucket
      destUrl: false,                    // destination url
      filename: false,
      destPath: false,
      format: {}
    }, params ) )

    .then( _setDestFileName )

    .then( _extractProcessConfig )

    .then( v => {

      if ( v.type === 'image' ) return _processImage( v );

      return v;

    } )

    .then( _upload )

    .done( v => {

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

    log( 'removing file %s from bucket %s', v.filename, v.bucket );

    s3Svc.remove( v.filename, { bucket: v.bucket }, err => {

      if ( err ) return rj( err );

      log( 'image removed' );

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


function _checkDestExistence( v ) {

  log( 'check file existence' );

  return _checkExistence( v, getFilePathData( v.fileKey, v.name, v.type ).url );

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

  log( 'uploading %s to bucket %s', v.processedPath || v.path, v.bucket );

  return w.promise( ( rs, rj ) => {

    s3Svc.store( v.processedPath || v.path, {
      bucket: v.bucket,
      clearOrigin: true
    }, err => {

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

  let i = getFilePathData( v.fileKey, v.name, v.type );

  v.bucket = i.bucket;

  v.filename = i.name;

  v.destUrl = i.url;

  log( 'bucket set to %s', v.bucket );

  log( 'dest file name set to %s', v.filename );

  log( 'destination url will be %s', v.destUrl );

  return v;

}


function getFilePathData( fileKey, fieldName, fileType = 'image' ) {

  const extension = ( {
    image: 'jpg',
    pdf: 'pdf'
  } )[ fileType ];

  const imageName = [ fileKey, 'event', fieldName, extension ].join( '.' );

  return {
    bucket: config.aws.bucket,
    name: imageName,
    url: config.aws.imageBucketPath + imageName
  }

}