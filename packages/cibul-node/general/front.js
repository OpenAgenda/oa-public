"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

Mailjet = require( 'mailjet' ),

path,

coms = require( '../lib/coms' ),

routes = {
  corpoHome: [ 'get', '/', index( 'home' ) ],
  corpoFeatures: [ 'get', '/features', index( 'features' ) ],
  corpoPricing: [ 'get', '/services', index( 'pricing' ) ],
  corpoAbout: [ 'get', '/about', index( 'about' ) ],
  newsletterSubscribe: [ 'post', '/newsletter/subscribe', newsletterSubscribe ],
  serviceConnectCallback: [ 'get', '/services/:service/connect/callback', serviceConnectCallback ]
};

module.exports = function( p ) {

  path = p;

  var router = modLib.Router( routes );

  router.pre([
    cmn.loadLogger( 'general' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( function() {}, 'oa.css' )
  ]);

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * controllers
 */

function index( view ) {

  return function( req, res ) {

    cmn.https( req, res, function() {

      if ( req.session.logged ) {

        cmn.redirect( req, res, 'homeShow' );

        return;

      }

      cmn.render( req, res, 'corpo/index', { tab: view } );

    });

  }

}



function newsletterSubscribe( req, res ) {

  var data = {
    id: 595683,
    contact: req.body.email
  },

  instance = new Mailjet( config.mailjet.apiKey, config.mailjet.apiSecret, { secure: true, output: 'json' } );

  instance.sendRequest( 'listsaddContact', data, 'POST', function( err, status, result, headers ) {

    if ( status === 200 ) {

      cmn.redirect( req, res, 'corpoHome', {}, 'You have been added to the newsletter list. Thanks!' );

      coms.queue( 'mailer', {

        recipient: [ 'romain@cibul.net', 'kaore@cibul.net' ],
        text: '"' + req.body.email + '" a été ajouté à la newsletter.'
      
      } );

    } else {

      cmn.redirect( req, res, 'corpoHome', {}, 'Either the email is invalid or the newsletter service is unavailable. Please try again later.' );

    }

  });

}

function serviceConnectCallback( req, res ) {

  var stateObj,

  tokens;

  try {

    stateObj = new Buffer( req.query.state, 'base64' );

    stateObj = JSON.parse( stateObj );
    
  } catch( e ) {

    return cmn.catchError( req, res )( { code: 500, message: 'invalid parameters' } );

  }


  return cmn.redirect( req, res, 'serviceSynchronize', { slug: stateObj.slug, service: req.params.service, code: req.query.code } );

}