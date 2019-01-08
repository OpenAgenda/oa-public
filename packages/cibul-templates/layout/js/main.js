"use strict";

const openRequestForm = require( '@openagenda/call-to-action/dist/client/openRequestForm' );

// import ie8 from 'dom-utils/ie8'; // useful for ie11 too
// import ie9 from 'dom-utils/ie9'; // useful for ie11 too


var utils = require( '@openagenda/utils' ),

  du = require( '../../js/lib/domUtils' ),

  mobileMonitor = require( './handleMobileMonitor.js' ),

  mobileMenu = require( './mobileMenu' ),

  messageLinks = require( './handleMessageLinks.js' ),

  confirmMessage = require( './confirmMessage' ),

  headerProfile = require( './headerProfile' ),

  toggle = require( './toggle' ),

  preloadSpin = require( './preloadSpin' ),

  debug = require( 'debug' ),

  layout = require( './layout' ),

  log = debug( 'main' ),

  flash = require( './handleFlashMessage.js' ),

  notifications = require( '@openagenda/activity-apps/dist/notifications' ),

  inbox = require( '@openagenda/inbox-apps/dist/apps/header' ),

  inboxConversationForm = require( '@openagenda/inbox-apps/dist/apps/conversationForm' ),

  LE = require( './le' ),

  Raven = require( 'raven-js' ),

  callToAction = require( '@openagenda/call-to-action/dist/client' ),

  eh = require( '../../js/lib/EventHandler/EventHandler.js' ).sEventHandler.getInstance(),

  ran = false, asapRan = false,

  hooks = [], asaps = [],

  params = {};

window.IScroll = require( 'iscroll/build/iscroll' );

du.asapReady( function () {

  preloadSpin();

  if ( !utils.size( params ) ) {

    utils.extend( params, layout.getOptions( 'body' ) );

  }

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( params.env == 'development' || window.env == 'development' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  mobileMenu();

  messageLinks( eh );

  confirmMessage();

  toggle();

  flash();

  notifications();

  inbox();

  inboxConversationForm();

  callToAction();

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

  if ( typeof zE !== 'undefined' && params.lang ) {

    zE( function () {

      zE.setLocale( params.lang );

    } );

  }

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

    LE.init( errorsTrackingConfig.insightOpsKey );

  } catch ( e ) {
  }

  try {

    Raven.config( errorsTrackingConfig.sentryDsn, {
      dataCallback( data ) {

        try {

          LE.log( data );

        } catch ( e ) {
        }

        return data;

      }
    } ).install();

  } catch ( e ) {
  }

} );
