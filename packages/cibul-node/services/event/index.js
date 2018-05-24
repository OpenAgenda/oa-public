"use strict";

var log = require( '@openagenda/logger' )( 'service:event' ),

config = require( '../../config' ),

model = require( '../model' ),

es = require( '../elasticsearch' ),

coms = require( '../../lib/coms' ),

exportLib = require( './exportLib' );

module.exports = {
  initless: true,
  get,
  search: es.search,
  create,
  share: require( './share' ),
  list: model.events().list,
  instanciate: require( './instance' ),
  STATETYPES: model.events().STATETYPES,
  getIcsHead: require( './instance/ics' ).head
}

module.exports.mw = require( './middleware' )( module.exports );

module.exports.exports = require( './exportLib' )( module.exports );

module.exports.locations = require( './locations' )( module.exports );


function get( params, cb ) {

  model.events().get( params, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result ? module.exports.instanciate( result ) : null );

  } );

}


function create( data, cb ) {

  model.events().create( data, function( err, created ) {

    if ( err ) return cb( err )

    coms.publish( config.mainChannel, {
      name: 'event.publish',
      values: { id: created.id }
    } );

    get( { id: created.id }, cb );

  } );

}