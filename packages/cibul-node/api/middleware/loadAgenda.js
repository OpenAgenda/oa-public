"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = async ( req, res, next ) => {

  agendas.get( { uid: req.params.agendaUid }, {
    private: null,
    internal: true
  }, ( err, agenda ) => {

    if ( err ) return next( err );

    if ( !agenda ) {

      return res.status( 404 ).json( {
        error: 'agenda not found',
        agendaUid: req.params.agendaUid
      } );

    }

    req.agenda = agenda;

    next();

  } );

}