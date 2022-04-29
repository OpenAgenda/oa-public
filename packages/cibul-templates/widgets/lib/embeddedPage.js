"use strict";

var frameLink = require( './frameLink' ).frame,

debug = require( 'debug' ), log,

cn = require( '../../js/lib/common' ),

pageHeight = require( './pageHeight' ),

linkClickController = false;

module.exports = function( pageOptions ) {

  var sendFunc;

  log = debug( 'embedded' );

  log( 'initing' );

  _catchLinkEvents();

  frameLink( function( s ) {

    sendFunc = s;

    log( 'linked with parent' );

    pageHeight.setOnChange( function( height ) {

      sendFunc( {
        height: height
      } );
        
    } );

    sendFunc( {
      height: pageHeight.get() 
    } );

    linkClickController = function( href, target ) {

      sendFunc( {
        load: href,
        target: target
      } );

    };


  }, function( parentMessage ) {

    if ( pageOptions.onReceive ) pageOptions.onReceive( parentMessage );

  });

  return {
    send: function( data ) {

      if ( sendFunc ) {

        sendFunc( data );

      } else {

        log( 'send is not ready' );

      }

    },
    contentChange: function() {

      pageHeight.check();

      _catchLinkEvents();

    }
  }

}


function _catchLinkEvents() {

  var flaggedAttr = 'data-frame-link';

  cn.forEach( cn.els( 'a' ), function( linkElem ) {

    if ( linkElem.hasAttribute( 'data-frame-link' ) ) return;

    linkElem.setAttribute( 'data-frame-link', 'checked' );

    cn.addEvent( linkElem, 'click', function( e ) {

      cn.preventDefault( e );

      if ( !linkClickController ) return;

      linkClickController( linkElem.href, linkElem.hasAttribute( 'target' ) ? linkElem.getAttribute( 'target' ) : false );

    });

  });

}
