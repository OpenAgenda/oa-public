"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' );

module.exports = {
  frame: parentLink, // link with parent window
  parent: frameLink  // link with frame window
}

function parentLink( onLinkEstablished, onParentMessage ) {

  var log = debug( 'parentLink ( frame script )' ),

  handShakeComplete = false;

  window.addEventListener( 'message', function _onParentMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'received hanshake request from parent' );

      window.parent.postMessage( { href: window.location.href }, e.origin );

      handShakeComplete = true;

      onLinkEstablished( function( message ) {

        log( 'sending message to parent: ', JSON.stringify( message ) );

        window.parent.postMessage( JSON.stringify( message ), e.origin );

      });

    } else {

      log( 'received message from parent' );

      onParentMessage( JSON.parse( e.data ) );

    }

  }, false );

}


function frameLink( elem, onLinkEstablished, onReceive ) {

  var log = debug( 'frameLink ( parent script )' ),

  frameSrc, handShakeComplete = false;

  cn.addEvent( elem, 'load', function() {
    
    _stop();

    _start();

  });

  _start();

  return;
  

  function _start() {

    frameSrc = _appendProtocol( elem.getAttribute( 'src' ) );

    log( 'establishing link on frame with %s', frameSrc );

    handShakeComplete = false;

    window.addEventListener( 'message', _onFrameMessageReceived, frameSrc );

    elem.contentWindow.postMessage( true, frameSrc );

  }


  function _stop() {

    window.removeEventListener( 'message', _onFrameMessageReceived );

  }


  function _onFrameMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'link with frame established' );
      
      onLinkEstablished( e.data.href, function( message ) {

        elem.contentWindow.postMessage( JSON.stringify( message ), frameSrc );

      } );

      handShakeComplete = true;

    } else {

      log( 'receiving message from frame: %s', e.data );

      onReceive( typeof e.data == 'string' ? JSON.parse( e.data ) : e.data );

    }

  }

  function _appendProtocol( href ) {

    if ( href.substr( 0, 2 ) == '//' ) {

      return window.location.href.split('//')[0] + href;

    }

    return href;

  }

}