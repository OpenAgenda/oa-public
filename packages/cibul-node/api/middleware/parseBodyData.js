"use strict";

module.exports = async ( req, res, next ) => {

  try {

    req.parsedData = JSON.parse( req.body.data );

  } catch ( e ) {

    return res.status( 400 ).json( {
      error: 'provided json is invalid',
      agendaUid: req.params.agendaUid,
      json: req.body.data
    } );

  }

  next();

}
