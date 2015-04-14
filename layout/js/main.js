"use strict";

var cn = require('../../js/lib/common/common.mod.js'),

mobileMonitor = require('./handleMobileMonitor.js'),

mobileMenu = require( './mobileMenu' ),

messageLinks = require('./handleMessageLinks.js'),

confirmMessage = require( './confirmMessage' ),

cibulMessage = require( './cibulMessage' ),

handleSession = require( './handleSession' ),

headerProfile = require( './headerProfile' ),

toggle = require( './toggle' ),

debug = require('debug'),

layout = require( './layout' ),

log = debug('globals'),

flash = require('./handleFlashMessage.js'),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance(),

ran = false,

hooks = [],

params = {};

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

  //_languageMenu( options.langHeadMenu );

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



/**
 * toggle language menu display
 */

function _languageMenu( options ) {

  var params = cn.extend( {
    selectors: {
      main: '.js_top_nav',
      langMenu: '.js_language_menu',
    }
  }, options ? options : {} ),

  langOn = false,

  headElem = cn.el( params.selectors.main ),

  langMenuElem = cn.el( headElem, params.selectors.langMenu );

  if ( !langMenuElem ) return;

  var langList = cn.el( langMenuElem, 'ul' );

  cn.addEvent( langMenuElem, 'click', function( e ) {

    cn.preventDefault( e );

    if ( !langOn ) {

      langList.style.display = 'block';

    } else {

      langList.removeAttribute( 'style' );

    }

    langOn = !langOn;

  });

}