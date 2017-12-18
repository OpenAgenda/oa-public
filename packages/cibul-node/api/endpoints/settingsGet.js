"use strict";

const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  try {

    const result = await core.agendas( req.agenda.uid ).settings.get();

    res.json( {
      form: result.fields
    } );

  } catch ( e ) {

    next( new VError( e, 'agenda settings get error' ) );

  }

}