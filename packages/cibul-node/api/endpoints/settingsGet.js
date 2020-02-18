"use strict";

const VError = require( 'verror' );

module.exports = async ( req, res, next ) => {

  try {

    const result = await req.app.services.core.agendas( req.agenda.uid ).settings.get();

    res.json( {
      form: result.fields
    } );

  } catch ( e ) {

    next( new VError( e, 'agenda settings get error' ) );

  }

}
