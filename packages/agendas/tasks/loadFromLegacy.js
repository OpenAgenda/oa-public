"use strict";

module.exports = Object.assign( loadFromLegacy, { init } );

const async = require( 'async' );

let svc, // agenda service

  legacy = require( '../service/legacy' );


function loadFromLegacy( cb ) {

  if ( !svc ) return cb( 'task: service is not initialized' );

  // scan agendas: for each, load legacy settings, merge and update.
  let offset = 0, more = true,

  result = {
    processed: 0
  };

  async.whilst( () => more, wcb => {

    svc.list( offset, 1, { internal: true }, ( err, agendas ) => {

      more = !!agendas.length;
      offset++;

      if ( !more ) return wcb();

      let agenda = agendas[ 0 ];

      legacy( agenda.id ).loadFromLegacy( ( err, legacyData ) => {

        svc.set( agenda.id, Object.assign( agenda, legacyData ), { internal: true, protected: false }, ( err, result ) => {

          wcb();

        } );

      } );

      result.processed++;

    } );

  }, err => {

    if ( err ) return cb( err );

    cb( null, result );

  } );

}


function init( s ) {

  svc = s;

}
