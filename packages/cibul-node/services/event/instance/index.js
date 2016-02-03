"use strict";

var model = require( '../../model' ),

state = require( './state' ),

custom = require( './custom' ),

dispatcher = require( './dispatcher' ),

utils = require( '../../../lib/utils' ),

config = require( '../../../config' ),

imageSvc = require( 'images' ),

s3Svc = require( 'files' ).s3,

fileSvc = require( 'files' ).file,

exportable = require( './exportable' ),

onRefresh, // used for testing

range = require( 'date-range' );

module.exports = instanciate;

module.exports.test = {
  setOnRefresh: setOnRefresh
}

function instanciate( data ) {

  var instance = model.events().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    setImage: setImage,
    getImage: _imageGetter( 'getImage' ),
    getThumbnail: _imageGetter( 'getThumbnail' ),
    getFullImage: _imageGetter( 'getFullImage' ),
    remove: remove,
    transferOwnership: transferOwnership,
    refresh: refresh,
    getRange: getRange
  }),

  dsp = dispatcher( svcInstance, instance );

  state( svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange'
  ] );

  custom( svcInstance, instance, [
    'loadAgendaCustomContext', // load agenda context
    'setCustomImage',          // process custom image upload
    'unsetCustomImage',        // take a wild guess
    'saveCustomImage'          // switch custom image from tmp store to permanent
  ] );

  exportable( svcInstance, instance, [
    'exportable'
  ] );

  svcInstance.setOnStateChange( dsp.stateChange );

  instance.onSave = dsp.onSave;

  return svcInstance;

  // assuming for now that input is url
  function setImage( url, cb ) {

    // assuming event is created
    var name = 'event' + instance.uid;

    imageSvc.multi( {
      url: url
    }, [
      { name: name, format: { width: 600 } },
      { name: 'evf' + name },
      { name: 'evtb' + name, format: { width: 120, height: 160, crop: true } }
    ], function( err, imagePaths ) {

      if ( err ) return cb( err );

      s3Svc.store( imagePaths, function( err ) {

        if ( err ) return cb( err );

        if ( instance.getImage() === name + '.jpg' ) {

          return cb();

        }

        instance.setImage( name + '.jpg', function( err ) {

          if ( err ) return cb( err );

          instance.save( { image: name + '.jpg' }, cb );

        } );

      });

    } );

  }


  function remove( cb ) {

    instance.remove( function( err ) {

      if ( err ) return cb( err );

      dsp.onRemove();

      cb();

    });

  }


  function transferOwnership( userId, cb ) {

    instance.save( { ownerId: userId }, cb );

  }


  function refresh( cb ) {

    if ( onRefresh ) onRefresh( parseInt( instance.id ) );

    instance.save( { updatedAt: new Date() }, err => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of event %s', event.uid );

      }

      if ( cb ) return cb( err );

    } );
    
  }


  function getRange() {

    return range( instance.getTimings().map( t => {

      return {
        start: new Date( t.start ),
        end: new Date( t.end )
      }

    } ), instance.getCurrentLanguage() );

  }


  function _imageGetter( method ) {

    return function() {

      var image = instance[ method ]();

      if ( !image ) return image;

      return config.aws.imageBucketPath + image;

    }

  }

}


function setOnRefresh( cb ) {

  onRefresh = cb;

}