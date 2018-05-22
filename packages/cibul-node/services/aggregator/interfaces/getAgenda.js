"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );

module.exports = identifier => {

  return new Promise( ( rs, rj ) => {

    agendas.get( _.isObject( identifier ) ? identifier : { uid: identifier }, {
      internal: true,
      private: null
    }, ( err, agenda ) => {

      if ( err ) return rj( err );

      rs( agenda );

    } );

  } );

}