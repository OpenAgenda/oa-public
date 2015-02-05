"use strict";

var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

frameLink = require( '../lib/frameLink' ).parent,

debug = require( 'debug' ),

config = {
  events: {
    heightChange: 'height'
  }
};

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) debug.enable( '*' );


/**
 * register the widget
 */

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgbdy', { register: register }, widget );

});


/**
 * define widget
 */

function widget( elem, options ) {

  var log = debug( 'body' ),

  controller;

  ( function() {

    var uid = _readUid( options.anchorConfig );

    _frameLink( function( sendFunc ) {

      //sendFunc( 'parent sending to child' );

    }, function( frameMessage ) {

      if ( frameMessage.height ) _adjustFrameHeight( frameMessage.height );

    } );

  } )();


  function _frameLink( onReady, onMessage ) {

    // for first page load
    var handler = frameLink( elem, onReady, function( message ) {

      if ( message.load ) { 

        _resetLink( handler, message.load );

      } else {

        onMessage( message );

      }

    }, 'http://localhost:3000/agenda/embedShow' );

    // for subsequent frame loads
    cn.addEvent( elem, 'load', function() {

      handler.start();

    });

  }

  function _resetLink( handler, src ) {

    handler.stop();

    elem.setAttribute( 'src', src );

    handler.resetSrc( src );

    handler.start();

  }


  function _readUid( src ) {

    var parts = src.split('/');

    return parts.splice(parts.length-2, 2).join('/').split('?')[ UID ];

  }


  function _adjustFrameHeight( newHeight ) {

    log( 'adjusting frame height to %s', newHeight );

    elem.setAttribute( 'height', newHeight );

  }

}