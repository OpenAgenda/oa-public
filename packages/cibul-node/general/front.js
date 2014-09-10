var debug = require( 'debug'),

log = debug( 'general' ),

express = require( 'express' ),

mwLib = require( '../middleware' ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib.js' ), 

router = require( '../router.js' );

module.exports = function( base, config ) {

  var app = express(),

  mw = mwLib( null, router, config ); // no shit is given here.

  app.set( 'base', base );

  app.set( 'name', 'general' );

  app.all( base + '*', router.loadUrlGen( app ), mw.loadSession );

  router.loadRoutes(app, controllers( app, mw ) );

  return app;

};

var controllers = function( app, mw ) {

  var map = function() {

    return {
      presentation: [ 'get', presentation, '' ]
    };

  },

  presentation = function( req, res ) {

    mw.render( req, res, 'presentation/index', _layoutData() );

  };

  return map();

},

_layoutData = function( ) {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    }
  };

};