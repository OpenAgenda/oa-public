"use strict";

var model = require( '../../model' ),

state = require( './state' ),

utils = require( '../../../lib/utils' ),

coms = require( '../../../lib/coms' ),

config = require( '../../../config' );

module.exports = function( data ) {

  var instance = model.events().instance( data );

  instance.onSave = onSave;

  var svcInstance = utils.extend( {}, instance, {
    setImage: setImage,
    getImage: _imageGetter( 'getImage' ),
    getThumbnail: _imageGetter( 'getThumbnail' ),
    getFullImage: _imageGetter( 'getFullImage' ),
    remove: remove
  });

  state( svcInstance, instance, [
    'setState',
    'getState'
  ] );

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

  function onSave() {

    coms.publish( config.mainChannel, { name: 'event.update', values: { id: instance.id } } );

  }

  function remove( cb ) {

    instance.remove( function( err ) {

      if ( err ) return cb( err );

      coms.publish( config.mainChannel, { name: 'event.delete', values: { id: instance.id } } );

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