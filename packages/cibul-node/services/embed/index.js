"use strict";

var log = require( '@openagenda/logger' )( 'embed service' ),

model = require( '../model' ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

agendaSvc = require( '../agenda' );

module.exports = {
  initless: true,
  get
}

module.exports.mw = require( './middleware' )( module.exports );

function get( params, cb ) {

  model.reviewEmbeds().get( params, function( err, result ) {

    if ( err ) return cb( err );

    if ( !result ) return cb( 'embed configuration not found' );

    cb( null, instanciate( result ) );

  });

}

function instanciate( data ) {

  const instance = model.reviewEmbeds().instance( data );

  let agenda;

  return lib.extend( {}, instance, {
    getControlData
  } );

  function getControlData( cb ) {

    getAgenda( ( err, a ) => {

      if ( err ) return cb( err );

      a.getControlData( ( err, ctlData ) => {

        instance.decorateAgendaControlData( ctlData, cb ); 

      } );

    } );

  }

  function getAgenda( cb ) {

    if ( agenda ) return cb( null, agenda );

    instance.getAgenda( function( err, a ) {

      if ( err ) cb( err );

      agenda = agendaSvc.instanciate( a );

      cb( null, agenda );

    });

  }

}
