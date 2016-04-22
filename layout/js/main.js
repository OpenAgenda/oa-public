"use strict";

var utils = require( 'utils' ),

du = require( '../../js/lib/domUtils' ),

mobileMonitor = require('./handleMobileMonitor.js'),

mobileMenu = require( './mobileMenu' ),

messageLinks = require('./handleMessageLinks.js'),

confirmMessage = require( './confirmMessage' ),

cibulMessage = require( './cibulMessage' ),

handleSession = require( './handleSession' ),

headerProfile = require( './headerProfile' ),

outdated = require( 'outdated-browser-rework' ),

toggle = require( './toggle' ),

debug = require('debug'),

layout = require( './layout' ),

log = debug('globals'),

flash = require('./handleFlashMessage.js'),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance(),

ran = false, asapRan = false,

hooks = [], asaps = [],

params = {};

outdated( {
  browserSupport: {
    'Chrome': 33,
    'IE': 9,
    'Safari': 5,
    'Mobile Safari': 5,
    'Firefox':  24
  }
});

/**
 * provide function to retrieve session data
 */

window.getSession = handleSession();


du.asapReady( function() {

  if ( !utils.size( params ) ) {

    utils.extend( params, layout.getOptions( 'body' ) );
    
  }

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( params.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  mobileMenu();

  messageLinks( eh );

  confirmMessage();

  toggle();

  flash();

  cibulMessage();

  du.forEach( asaps, function( asapHook ) {

    asapHook( params );

  });

  asapRan = true;

} );


du.addEvent( window, 'load', function() {

  if ( !utils.size( params ) ) {

    utils.extend( params, layout.getOptions( 'body' ) );

  }

  headerProfile( params.profile );

  du.forEach( hooks, function( hook ) {

    hook( params );

  });

  ran = true;

} );


/**
 * provide hook for page specific script launchers
 * which are to be called when page is ready
 */

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};


/**
 * same as hook, but ready as soon as options are
 * available
 */

window.asap = function( cb ) {

  if ( asapRan ) return cb( params );

  asaps.push( cb )

}