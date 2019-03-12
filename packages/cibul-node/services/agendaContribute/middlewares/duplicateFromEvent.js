"use strict";

const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/duplicateFromEvent' );

const core = require( '../../../core' );

module.exports = async ( req, res, next ) => {

  if ( !req.query.agendaUid || !req.query.eventUid ) {

    return next();

  }

  // fetch event, strip image and location...
  const event = await core.agendas( req.query.agendaUid ).events.get( req.query.eventUid );

  if ( !event ) {

    return next();

  }

  // location cannot be used as is.
  req.event = ih( event, { $unset: [ 'agenda', 'slug', 'uid', 'locationUid', 'fileKey', 'state', 'timings' ] } );

  next();

}
