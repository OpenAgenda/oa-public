'use strict';

const path = require( 'path' );
const _ = require( 'lodash' );
const express = require( 'express' );
const matchMw = require( '@openagenda/react-integration-app/middleware' );
const activitiesSvc = require( '@openagenda/activities' );
const { Inbox } = require( '@openagenda/inboxes' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const apiRoot = `http://localhost:${config.port}`;

module.exports = app => {

  app.use( '/dist/react-integration-app',
    express.static( path.join(
      path.dirname( require.resolve( '@openagenda/react-integration-app/package.json' ) ),
      'dist'
    ) ),
    ( req, res, next ) => res.status( 404 ).send( 404 ) // if not, unhandled files will be handled by following routes
  );

  app.get(
    [ '/home', '/home/events', '/home/activities', '/settings/?*?', '/new' ],
    cmn.loadLogger( 'webapp' ),
    cmn.loadBaseData( 'oasfmain.css' ),
    matchMw( { apiRoot, hasInboxNews } )
  );

};

function notificationsCounter( req ) {
  return activitiesSvc.feed( {
    entityType: 'user',
    entityUid: req.user.uid
  } ).notifications.count( { state: 0 } );
}

async function hasInboxNews( req ) {
  const { data } = await Inbox.user( req.user.uid ).conversations.list( 0, 1 );
  const timestamp = _.get( data, '[0].latestMessage.createdAt' );

  if ( !timestamp ) {
    return false;
  } else if ( !req.user.lastInboxCheck ) {
    return true;
  } else if ( timestamp > req.user.lastInboxCheck ) {
    return true;
  }

  return false;
}
