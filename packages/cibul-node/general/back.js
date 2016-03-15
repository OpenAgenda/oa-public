"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

mailer = require( 'mailer' ),

config = require( '../config' ),

bodyParser = require( 'body-parser' ),

userSvc = require( '../services/user' ),

routes = {

  featureRequest: [ 'post', '/featurerequest', [
    bodyParser.json(),
    _loadUser,
    featureRequest 
  ] ],

  sns: [ 'post', '/aws/sns', [
    bodyParser.json(),
    sns
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre([
    cmn.loadLogger( 'general/back' ),
    cmn.loadSession
  ]);

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


function sns( req, res, next ) {

  console.log( 'sns' );

  console.log( req.query );
  console.log( req.body );

  res.send( 'ok' );

}