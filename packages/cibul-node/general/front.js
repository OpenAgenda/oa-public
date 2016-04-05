"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),
  
newsletter = require( 'newsletter' ),

mailer = require( '../services/mailer' ),

model = require( '../services/model' ),

path,

coms = require( '../lib/coms' ),

w = require( 'when' ),

routes = {
  corpoHome: [ 'get', '/', index( 'home' ) ],
  corpoFeatures: [ 'get', '/features', index( 'features' ) ],
  corpoPricing: [ 'get', '/services', index( 'pricing' ) ],
  corpoApi: [ 'get', '/interface', index( 'api' ) ],
  corpoAbout: [ 'get', '/about', index( 'about' ) ],
  newsletterSubscribe: [ 'post', '/newsletter/subscribe', newsletterSubscribe ],
  serviceConnectCallback: [ 'get', '/services/:service/connect/callback', serviceConnectCallback ],
  emailUnsubscribe: [ 'get', '/unsubscribe', unsubscribe ],
  emailUnsubscribeSubmit: [ 'post', '/unsubscribe', unsubscribeSubmit ]
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

        res.redirect( 302, req.genUrl( 'homeShow' ) );

        return;

      }

      cmn.render( req, res, 'corpo/index', { tab: view } );

    });

  }

}



function newsletterSubscribe( req, res ) {

  newsletter.addSubscriber( req.body.email, ( err, result ) => {

    if ( err ) {

      req.log( 'error', { service: 'newsletter', message: result.message, error: result.message } );

      res.setFlash( req, 'Either the email is invalid or the newsletter service is unavailable. Please try again later.' );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );
      
    } else {

      res.setFlash( req, 'You have been added to the newsletter list. Thanks!' );

      res.redirect( 302, req.genUrl( 'corpoHome' ) );

      mailer.queueMail( {
        subject: 'Nouvel inscrit à la newsletter',
        recipient: [ 'romain@cibul.net', 'kaore@cibul.net' ],
        text: '"' + req.body.email + '" a été ajouté à la newsletter.'
      } );
      
    }

  } );

}

function unsubscribe( req, res ) {

  cmn.render( req, res, 'general/unsubscribe', {
    email: '',
    error: false
  } );

}

function unsubscribeSubmit( req, res ) {

  model.unsubscribed().create( {
    email: req.body.email
  }, function( err, entry ) {

    if ( err ) {

      cmn.render( req, res, 'general/unsubscribe', {
        email: req.body.email ? req.body.email : '',
        error: err
      });

    } else {

      res.setFlash( req, 'You will from now on no longer receive event emails at the address %email%', { '%email%' : req.body.email } );

      res.redirect( 302, '/' );

    }

  } );

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


  res.redirect( 302, req.genUrl( 'serviceSynchronize', { slug: stateObj.slug, service: req.params.service, code: req.query.code } ) );

}