"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

mailer = require( 'mailer' ),

config = require( '../config' ),

utils = require( 'utils' ),

invitationSvc = require( '../services/invitation' ),

bodyParser = require( 'body-parser' ),

userSvc = require( '../services/user' ),

routes = {

  featureRequest: [ 'post', '/featurerequest', [
    cmn.loadLogger( 'featureRequest' ),
    bodyParser.json(),
    _loadUser,
    featureRequest 
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
  ] ]

};

module.exports = path => {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
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

function _loadUser( req, res, next ) {

  userSvc.get( { id: req.user.id }, ( err, user ) => {

    if ( err ) return next( err );

    req.user = user;

    next();

  });

}


function snsMailReports( req, res, next ) {

  try {

    let body = JSON.parse( req.body ),

    message = JSON.parse( body.Message );

    req.log( 'info', utils.extend( body, message ) );

  } catch( e ) {

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

  } catch( e ) {

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