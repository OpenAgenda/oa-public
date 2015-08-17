"use strict";

var log = require( 'logger' )( 'event service' ),

config = require( '../../config' ),

model = require( '../model' ),

es = require( '../es/es' ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

exportLib = require( './exportLib' );

module.exports = {
  get: get,
  search: es.search,
  create: create,
  share: require( './share' ),
  list: model.events().list,
  instanciate: require( './instance' ),
  STATETYPES: model.events().STATETYPES
}

module.exports.mw = require( './middleware' )( module.exports );

module.exports.exports = require( './exportLib' )( module.exports );


function get( params, cb ) {

  model.events().get( params, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, result ? module.exports.instanciate( result ) : null );

  });

}


function create( data, cb ) {

  model.events().create( data, function( err, created ) {

    if ( err ) return cb( err )

    coms.publish( config.mainChannel, { name: 'event.publish', values: { id: created.id } } );

    get( { id: created.id }, cb );

  } );

}