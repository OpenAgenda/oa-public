"use strict";

const sessions = require( '@openagenda/sessions' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );
const cmn = require( '../lib/commons-app' );

const preMw = [
  cmn.loadLogger( 'home' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];

module.exports = app => {

  app.get(
    '/home/agendas',
    preMw,
    homeMw.agendas.list
  );

  app.get(
    '/home/events.json',
    preMw,
    homeMw.events.list
  );

  app.get(
    '/home/activities/list',
    preMw,
    ( req, res ) => activitiesMw.list( { entityType: 'user', entityUid: req.user.uid } )( req, res )
  );

}
