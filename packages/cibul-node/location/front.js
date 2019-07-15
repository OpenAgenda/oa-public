"use strict";

const agendaLocations = require( '@openagenda/agenda-locations' );
const cmn = require( '../lib/commons-app' );


module.exports = app => {

  app.get(
    '/locations/:locationUid.json',
    cmn.loadLogger( 'location front' ),
    agendaLocations.mw.get,
    ( req, res ) => cmn.renderJson( req, res, req.location )
  );

};
