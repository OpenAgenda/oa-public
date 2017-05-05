"use strict";

const agendas = require( 'agendas' );

let log = console.log;

module.exports = ( agendaId, cb ) => {

  agendas.get( { id: agendaId }, { instanciate: true, private: null }, ( err, agenda ) => {

    if ( err ) return cb( err );

    agenda.getRoles( ( err, credentials ) => {

      if ( err ) return cb( err );

      cb( null, credentials.map( c => c.value ) );

    } );

  } );

}

module.exports.setLog = l => log = l;