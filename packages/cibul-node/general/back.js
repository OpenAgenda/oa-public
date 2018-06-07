"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );

const callToActionMw = require( '@openagenda/call-to-action/middleware' );
const { Inbox } = require( '@openagenda/inboxes' );
const mailer = require( '@openagenda/mailer' );
const sessions = require( '@openagenda/sessions' );
const users = require( '@openagenda/users' );
const utils = require( '@openagenda/utils' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const invitationSvc = require( '../services/invitation' );
const modLib = require( '../lib/moduleLib' );

const routes = {

  featureRequest: [ 'post', '/featurerequest', [
    cmn.loadLogger( 'featureRequest' ),
    bodyParser.json(),
    sessions.middleware.load( { detailed: true } ),
    _loadUser.bind( null, false ),
    featureRequest
  ] ],

  request: [ 'post', '/request', [
    cmn.loadLogger( 'request' ),
    bodyParser.json(),
    sessions.middleware.load( { detailed: true } ),
    _loadUser.bind( null, false ),
    callToActionMw.request()
  ] ],

  snsMailReports: [ 'post', '/aws/sns', [
    cmn.loadLogger( 'sns' ),
    bodyParser.text(),
    snsMailReports
  ] ],

  snsMailReplies: [ 'post', '/aws/sns/mailreplies', [
    cmn.loadLogger( 'snsMailReplies' ),
    bodyParser.text(),
    snsMailReplies
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
  }

}


function featureRequest( req, res ) {

  mailer( {
    recipient: config.adminEmail,
    subject: 'Feature request from ' + req.user.email,
    text: `Origin: ${req.body.title} - ${req.body.source}

${req.body.message}
    `
  } );

  res.send( 'ok' );

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


function snsMailReports( req, res, next ) {

  try {

    let body = JSON.parse( req.body ),

      message = JSON.parse( body.Message );

    req.log( 'info', utils.extend( body, message ) );

  } catch ( e ) {

    req.log( 'error', 'could not read sns mail report: %s', req.body );

  }

  res.send( 'ok' );

}


function snsMailReplies( req, res, next ) {

  try {

    let body = JSON.parse( req.body ),

      messageId = body.MessageId,

      message = JSON.parse( body.Message ),

      destination = message.mail.destination[ 0 ],

      mailContent = mailer.parser.extract( message.content ),

      subject = message.mail.commonHeaders.subject,

      replyTo = message.mail.source;

    req.log( 'info', utils.extend( body, message ) );

  } catch ( e ) {

    req.log( 'error', 'could not read sns mail reply :%s', req.body );

    return res.send( 'ok' );

  }

  invitationSvc.mail.loadUserFromMaiIdentifier( destination, ( err, user ) => {

    if ( err || !user ) {

      req.log( 'error', 'could not fetch invitation creator: %s', err );

      return res.send( 'ok' );

    }

    if ( !mailContent.text && !mailContent.html ) {

      return res.send( 'ok' );

    }

    mailer( {
      recipient: user.email,
      replyTo: message.mail.source,
      subject: message.mail.commonHeaders.subject,
      text: mailContent.text,
      html: mailContent.html
    }, err => {

      res.send( 'ok' );

    } );

  } );


}
