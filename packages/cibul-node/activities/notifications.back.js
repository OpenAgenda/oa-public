"use strict";

const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const cmn = require( '../lib/commons-app' );


const preMw = [
  cmn.loadLogger( 'notifications' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) )
];


module.exports = app => {

  app.get( '/notifications/count', preMw, mw.notifications.count );

  app.get( '/notifications/list', preMw, mw.notifications.list );

  app.get( '/notifications/remove/:notifId', preMw, mw.notifications.remove );

  app.get( '/notifications/mark-read/:notifId', preMw, mw.notifications.markRead );

  app.get( '/notifications/mark-all-read', preMw, mw.notifications.markAllRead );

};
