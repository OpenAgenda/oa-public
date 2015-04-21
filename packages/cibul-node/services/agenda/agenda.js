"use strict";

var log = require( '../../lib/logger' )( 'agenda service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath, useCache: config.db.cache } ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' );

module.exports = {
  get: get
}

module.exports.mw = require( './middleware' )( module.exports );

function get( params, cb ) {

  model.agendas().get( params, function( err, result ) {

    if ( err ) return cb( err );

    if ( !result ) return cb( 'agenda not found' );

    cb( null, instanciate( result ) );

  });

}

function instanciate( data ) {

  var instance = model.agendas().instance( data )

  return lib.extend( {}, instance, {
    addEvent: addEvent,
    removeEvent: removeEvent
  });

  function addEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, stakeholder, function( err, result ) {

        if ( err ) return cb( err );
        
        coms.publish( config.mainChannel, { name: 'event.update', values: { id: event.id } } );

        cb();

      } );
      
    } );


  }

  function removeEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.removeEvent( event, function( err, count ) {

        if ( err ) return cb( err );

        coms.publish( config.mainChannel, { name: 'event.update', values: { id: event.id } } );

        cb();

      });


    } );

  }

}