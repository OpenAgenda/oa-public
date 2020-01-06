"use strict";

const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  try {
    res.json(await core.agendas(req.agenda.uid).settings.batchResync(req.parsedData));
  } catch ( e ) {
    next( new VError( e, 'agenda settings resync error' ) );
  }

}
