"use strict";

require( 'dom-utils/ie8' );

require( 'dom-utils/ie9' );

var utils = require( 'utils' ),

  du = require( '../../js/lib/domUtils' ),

  mobileMonitor = require( './handleMobileMonitor.js' ),

  mobileMenu = require( './mobileMenu' ),

  messageLinks = require( './handleMessageLinks.js' ),

  confirmMessage = require( './confirmMessage' ),

  headerProfile = require( './headerProfile' ),

  toggle = require( './toggle' ),

  debug = require( 'debug' ),

  layout = require( './layout' ),

  log = debug( 'main' ),

  flash = require( './handleFlashMessage.js' ),

  eh = require( '../../js/lib/EventHandler/EventHandler.js' ).sEventHandler.getInstance(),

  LE = require( 'le_js' ),

  Raven = require( 'raven-js' ),

  ran = false, asapRan = false,

  hooks = [], asaps = [],

  params = {};

du.asapReady( function () {

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

  du.forEach( asaps, function ( asapHook ) {

    asapHook( params );

  } );

  asapRan = true;

} );


du.addEvent( window, 'load', function () {

  if ( !utils.size( params ) ) {

    utils.extend( params, layout.getOptions( 'body' ) );

  }

  headerProfile( params.profile );

  du.forEach( hooks, function ( hook ) {

    hook( params );

  } );

  ran = true;

} );


/**
 * provide hook for page specific script launchers
 * which are to be called when page is ready
 */

window.hook = function ( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};


/**
 * same as hook, but ready as soon as options are
 * available
 */

window.asap = function ( cb ) {

  if ( asapRan ) return cb( params );

  asaps.push( cb )

}

window.hook( () => {

  if ( !window.errorsTrackingConfig ) return;
  const errorsTrackingConfig = window.errorsTrackingConfig;

  try {

    LE.init( errorsTrackingConfig.logentriesKey );
    
  } catch ( e ) {}

  Raven.config( errorsTrackingConfig.sentryDsn, {
    dataCallback( data ) {

      try {

        LE.log( data );

      } catch ( e ) {}

      return data;

    }
  } ).install();

} );
