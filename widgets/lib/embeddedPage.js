"use strict";

var frameLink = require( './frameLink' ).frame,

debug = require( 'debug' ), log,

cn = require( '../../js/lib/common/common.mod.js' ),

pageHeight = require( './pageHeight' ),

linkClickController = false;

module.exports = function( pageOptions ) {

  log = debug( 'embedded' );

  log( 'initing' );

  _catchLinkEvents();

  frameLink( function( sendFunc ) {

    log( 'linked with parent' );

    pageHeight.setOnChange( function( height ) {

      sendFunc( { height: height } );

    });

    pageHeight.check();

    linkClickController = function( href ) {
      sendFunc( { load: href } );
    };

    // sendFunc( 'child sending to parent' );

  }, function( parentMessage ) {

    if ( pageOptions.onReceive ) pageOptions.onReceive( parentMessage );

    // console.log( parentMessage );

  });

  return {
    checkHeight: pageHeight.check
  }

}


function _catchLinkEvents() {

  cn.forEach( cn.els( 'a' ), function( linkElem ) {

    cn.addEvent( linkElem, 'click', function( e ) {

      cn.preventDefault( e );

      if ( !linkClickController ) return;

      linkClickController( linkElem.href );

    });

  });

}