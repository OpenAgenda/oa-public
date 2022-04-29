"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common' );

module.exports = {
  frame: parentLink, // link with parent window
  parent: frameLink  // link with frame window
}

function parentLink( onLinkEstablished, onParentMessage ) {

  var log = debug( 'parentLink ( frame script )' ),

  handShakeComplete = false;

  window.addEventListener( 'message', function _onParentMessageReceived( e ) {

    // prevent interference from embedded media messages
    if ( [ 'vimeo.com', 'soundcloud.com', 'cdn.iframe.ly' ].filter( function( unauthorizedOrigin ) {

      return e.origin.indexOf( unauthorizedOrigin ) !== -1

    } ).length ) {

      console.log( 'unauthorized origin: %s', e.origin );

      return;

    }

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

      if ( typeof e.data !== 'string' ) return console.log( 'ignoring message' );

      onParentMessage( JSON.parse( e.data ) );

    }

  }, false );

}


function frameLink( elem, onLinkEstablished, onReceive ) {

  var log = debug( 'frameLink ( parent script )' ),

  frameSrc, handShakeComplete = false, repostDelay = 1000;

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

    _postInit();

  }


  function _postInit() {

    if ( handShakeComplete ) {

      return log( 'handshake is complete, no need to post init to frame' );

    }

    elem.contentWindow.postMessage( true, frameSrc );

    // repost in case handshake failed
    repostDelay = repostDelay * 1.2;

    setTimeout( () => _postInit(), repostDelay );

  }


  function _stop() {

    window.removeEventListener( 'message', _onFrameMessageReceived );

  }


  function _onFrameMessageReceived( e ) {

    var data;

    if ( !handShakeComplete ) {

      log( 'link with frame established' );
      
      onLinkEstablished( e.data.href, function( message ) {

        elem.contentWindow.postMessage( JSON.stringify( message ), frameSrc );

      } );

      handShakeComplete = true;

    } else {

      log( 'receiving message from frame: %s', e.data );

      data = false;

      try {

        data = typeof e.data == 'string' ? JSON.parse( e.data ) : e.data;

      } catch( e ) {}

      if ( data ) {

        onReceive( data );

      }

    }

  }


  function _appendProtocol( href ) {

    if ( href.substr( 0, 2 ) == '//' ) {

      return window.location.href.split('//')[0] + href;

    }

    return href;

  }

}
