/**
 * general purpose controllers
 */

var appName = 'general/front',

exposed = {
  load: load
},

routes = {
  presentation: [ 'get', presentation, '/' ],
  newsletterSubscribe: [ 'post', newsletterSubscribe, '/newsletter/subscribe' ],
  serviceConnectCallback: [ 'get', serviceConnectCallback, '/services/:service/connect/callback' ]
},

// libraries used

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

async = require( 'async' ),

Mailjet = require( 'mailjet' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

cmn = require( '../lib/commons-app' ),

coms = require( '../lib/coms' ),

app,

path;


// init and load functions

function init( p ) {

  log( 'debug', 'initing');

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'debug', 'this app has already been loaded' );

    return;

  }

  log( 'debug', 'loading' );

  app = cmn.loadApp( main, path, appName );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData()
  ] );

  return exposed;

}


/**
 * controllers
 */

function presentation( req, res ) {

  if ( req.session.logged ) {

    cmn.redirect( req, res, 'homeShow' );

    return;

  }

  cmn.render( req, res, 'presentation/index' );

};


function newsletterSubscribe( req, res ) {

  var data = {
    id: 595683,
    contact: req.body.email
  },

  instance = new Mailjet( config.mailjet.apiKey, config.mailjet.apiSecret, { secure: true, output: 'json' } );

  instance.sendRequest( 'listsaddContact', data, 'POST', function( err, status, result, headers ) {

    if ( status === 200 ) {

      cmn.redirect( req, res, 'presentation', {}, 'You have been added to the newsletter list. Thanks!' );

      coms.queue( 'mailer', {

        recipient: [ 'romain@cibul.net', 'kaore@cibul.net' ],
        text: '"' + req.body.email + '" a été ajouté à la newsletter.'
      
      } );

    } else {

      cmn.redirect( req, res, 'presentation', {}, 'Either the email is invalid or the newsletter service is unavailable. Please try again later.' );

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

module.exports = init;