"use strict";

var log = require( '../../lib/logger' )( 'embed service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' );

module.exports = {
  get: get
}

module.exports.mw = require( './middleware' )( module.exports );

function get( params, cb ) {

  model.agendas().get( params, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, instanciate( result ) );

  });

}

function instanciate( data ) {

  var instance = model.agendas().instance( data )

  return lib.extend( {}, instance, {
    render: render
  });

  // languages go where now ? where does rendered data go?

  function render( data, cb ) {

    var parser = tumblrParser( {
      // options here include allowed children & values & elements?
    });

    parser.load( '' ) // load template

    render = parser.render( data );

    cb( null, render );

  }

}