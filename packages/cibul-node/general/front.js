/**
 * general purpose controllers
 */

var appName = 'general/front',

exposed = {
  load: load
},

routes = {
  presentation: [ 'get', presentation, '/' ]
},

// libraries used

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

cmn = require( '../lib/commons-app' ),

app,

path;


// init and load functions

function init( p ) {

  log('initing');

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded' );

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadSession
  ] );

  return exposed;

}


/**
 * controllers
 */

function presentation( req, res ) {

  cmn.render( req, res, 'presentation/index', _layoutData() );

};


/**
 * controller helpers
 */

var _layoutData = function( ) {

  return {
    head: {
      css: {
        main: '/css/compiled.css'
      }
    }
  };

};

module.exports = init;