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

ran = false,

hooks = [],

params = {};

outdated( {
  browserSupport: {
    'Chrome': 33,
    'IE': 9,
    'Safari': 5,
    'Mobile Safari': 5,
    'Firefox':  25
  }
});

cn.addEvent( window, 'load', function() {

  var options = layout.getOptions( 'body' );

  cn.extend( params, options );

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( options.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  mobileMenu();

  messageLinks( eh );

  confirmMessage();

  toggle();

  flash();

  cibulMessage();

  headerProfile( options.profile );

  cn.forEach( hooks, function( hook ) {

    hook( params );

  });

} );


/**
 * provide hook for page specific script launchers
 */

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};

/**
 * provide function to retrieve session data
 */

window.getSession = handleSession();