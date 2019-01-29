"use strict";

const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );


const routes = {
  notificationsCount: [ 'get', '/count', mw.notifications.count ],
  notificationsList: [ 'get', '/list', mw.notifications.list ],
  notificationsRemove: [ 'get', '/remove/:notifId', mw.notifications.remove ],
  notificationsMarkRead: [ 'get', '/mark-read/:notifId', mw.notifications.markRead ],
  notificationsMarkAllRead: [ 'get', '/mark-all-read', mw.notifications.markAllRead ]
};


module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'notifications' ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};
