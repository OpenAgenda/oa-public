var debug = require( 'debug' );

module.exports = {
  frame: parentLink, // link with parent window
  parent: frameLink  // link with frame window
}

function parentLink( onLinkEstablished, onParentMessage ) {

  var log = debug( 'parentLink' ),

  handShakeComplete = false;

  window.addEventListener( 'message', function _onParentMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'received hanshake request from parent' );

      window.parent.postMessage( true, e.origin );

      handShakeComplete = true;

      onLinkEstablished( function( message ) {

        window.parent.postMessage( JSON.stringify( message ), e.origin );

      });

    } else {

      log( 'received message from parent' );

      onParentMessage( JSON.parse( e.data ) );

    }

  }, false );

}


function frameLink( elem, onLinkEstablished, onReceive, src ) {

  var log = debug( 'frameLink' );

  frameSrc = src ? src : elem.getAttribute( 'src' ),

  handShakeComplete = false;

  start();

  return {
    start: start,
    stop: stop,
    resetSrc: resetSrc
  }
  

  function start() {

    log( 'establishing link on frame with %s', frameSrc );

    handShakeComplete = false;

    window.addEventListener( 'message', _onFrameMessageReceived, frameSrc );

    elem.contentWindow.postMessage( true, frameSrc );

  }

  function stop() {

    window.removeEventListener( 'message' );

  }

  function resetSrc( src ) {

    frameSrc = src;

  }

  function _onFrameMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'link with frame established' );

      onLinkEstablished( function( message ) {

        elem.contentWindow.postMessage( JSON.stringify( message ), frameSrc );

      } );

      handShakeComplete = true;

    } else {

      log( 'receiving message from frame' );

      onReceive( JSON.parse( e.data ) );

    }

  }

}