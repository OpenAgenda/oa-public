"use strict";


var log = require( '../../lib/logger' )( 'event service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath, useCache: config.db.cache } ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

imageSvc = require( '../image/image' ),

s3Svc = require( '../file/s3' ),

fileSvc = require( '../file/file' );

module.exports = {
  get: get,
  create: create,
  share: require( './share' )
}

module.exports.mw = require( './middleware' )( module.exports );


function get( params, cb ) {

  model.events().get( params, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, result ? instanciate( result ) : null );

  });

}


function create( data, cb ) {

  model.events().create( data, function( err, created ) {

    if ( err ) return cb( err )

    coms.publish( config.mainChannel, { name: 'event.publish', values: { id: created.id } } );

    get( { id: created.id }, cb );

  } );

}

function instanciate( data ) {

  var instance = model.events().instance( data );

  instance.onSave = onSave;

  return lib.extend( {}, instance, {
    setImage: setImage,
    remove: remove
  });

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

}