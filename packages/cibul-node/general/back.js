"use strict";

const _ = require( 'lodash' );
const callToActionMw = require( '@openagenda/call-to-action/dist/middleware' );
const { Inbox } = require( '@openagenda/inboxes' );
const sessions = require( '@openagenda/sessions' );
const users = require( '@openagenda/users' );
const cmn = require( '../lib/commons-app' );


module.exports = app => {

  app.post(
    '/request',
    cmn.loadLogger( 'request' ),
    _loadUser.bind( null, false ),
    callToActionMw.request()
  );

  app.get(
    '/latest-inbox-timestamp',
    cmn.loadLogger( 'latestInboxMessageTimestamp' ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.send( null ) ),
    _loadUser.bind( null, true ),
    latestInboxMessageTimestamp
  );

};


function _loadUser( detailed, req, res, next ) {

  users.findOne( { query: { id: req.user.id }, detailed: true } )
    .then( user => {

      req.user = user;

      next();

    } )
    .catch( next );

}

function latestInboxMessageTimestamp( req, res, next ) {

  Inbox.user( req.user.uid ).conversations.list( 0, 1 ).then( ( { data } ) => {

    let hasNew = false;

    const latestConversation = _.head( data );

    if ( !latestConversation ) return res.send( { hasNew } );

    const timestamp = _.get( latestConversation, 'latestMessage.createdAt', null );

    if ( timestamp === null ) {

      hasNew = false;

    } else if ( !req.user.lastInboxCheck ) {

      hasNew = true;

    } else if ( timestamp > req.user.lastInboxCheck ) {

      hasNew = true;

    }

    res.send( { hasNew } );

  } ).catch( next );

}
