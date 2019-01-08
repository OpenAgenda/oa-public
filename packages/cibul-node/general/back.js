"use strict";

const _ = require( 'lodash' );

const callToActionMw = require( '@openagenda/call-to-action/dist/middleware' );
const { Inbox } = require( '@openagenda/inboxes' );
const sessions = require( '@openagenda/sessions' );
const users = require( '@openagenda/users' );

const cmn = require( '../lib/commons-app' );
const modLib = require( '../lib/moduleLib' );

const routes = {

  request: [ 'post', '/request', [
    cmn.loadLogger( 'request' ),
    sessions.middleware.load( { detailed: true } ),
    _loadUser.bind( null, false ),
    callToActionMw.request()
  ] ],

  latestInboxMessageTimestamp: [ 'get', '/latest-inbox-timestamp', [
    cmn.loadLogger( 'latestInboxMessageTimestamp' ),
    sessions.middleware.load( { detailed: true } ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.send( null ) ),
    _loadUser.bind( null, true ),
    latestInboxMessageTimestamp
  ] ]

};

module.exports = path => {

  return {
    load: modLib.Router( routes ).load( path ),
    paths: modLib.getPaths( path, routes )
  };

}


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
