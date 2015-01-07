"use strict";

var appName = 'auth/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

routes = {
  signin: [ 'get', signin, '/signin' ],
  signinSubmit: [ 'post', signinSubmit, '/signin' ]
},

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

app,

path,

model = cmn.getCibulModel();

function init( p ) {

  log( 'initing' );

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

  app.use( cmn.urlGenSetter( appName, path ) );

  cmn.loadRoutes( app, routes, [
    cmn.flashSetter,
    cmn.loadBaseData(),
    cmn.loadSession,
    cmn.requireUnlogged
  ] );

  return exposed;

}


/**
 * controllers
 */

function signin( req, res ) {

  cmn.render( req, res, 'auth/signin', { 
    errors: {},
    iToken: '',
    redirect: false,
    password: '',
    email: ''
  } );

}

function signinSubmit( req, res ) {



}

module.exports = init;