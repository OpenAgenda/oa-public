"use strict";

var cn = require('../../js/lib/common/common.mod.js'),

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


_onAsapReady( function() {

  _init();

  cn.forEach( asaps, function( asapHook ) {

    asapHook( params );

  });

  asapRan = true;

} );


cn.addEvent( window, 'load', function() {

  _init();

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( params.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  mobileMenu();

  messageLinks( eh );

  confirmMessage();

  toggle();

  flash();

  cibulMessage();

  headerProfile( params.profile );

  cn.forEach( hooks, function( hook ) {

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

/**
 * provide function to retrieve session data
 */

window.getSession = handleSession();



function _init() {

  // if there is stuff there already, this are inited.
  if ( cn.size( params ) ) return;

  var options = layout.getOptions( 'body' );

  cn.extend( params, options );

  return options;

}


/**
 * callsback when body elem is loaded
 */

function _onAsapReady( timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( cn.el( 'body' ) ) return cb();

  setTimeout( function() {

    _onAsapReady( Math.max( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

}