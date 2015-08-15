"use strict";

var model = require( '../../model' ),

state = require( './state' ),

dispatcher = require( './dispatcher' ),

utils = require( '../../../lib/utils' ),

config = require( '../../../config' ),

imageSvc = require( '../../image/image' ),

s3Svc = require( '../../file/s3' ),

fileSvc = require( '../../file/file' );

module.exports = function( data ) {

  var instance = model.events().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    setImage: setImage,
    getImage: _imageGetter( 'getImage' ),
    getThumbnail: _imageGetter( 'getThumbnail' ),
    getFullImage: _imageGetter( 'getFullImage' ),
    remove: remove
  }),

  dsp = dispatcher( svcInstance, instance );

  state( svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange'
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

      dispatcher.onRemove();

      cb();

    });

  }


  function _imageGetter( method ) {

    return function() {

      var image = instance[ method ]();

      if ( !image ) return image;

      return config.aws.imageBucketPath + image;

    }

  }

}