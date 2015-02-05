"use strict";

var frameLink = require( './frameLink' ).frame,

cn = require( '../../js/lib/common/common.mod.js' ),

linkClickController = false;

module.exports = function( pageOptions ) {

  _catchLinkEvents();

  frameLink( function( sendFunc ) {

    _onHeightChange( sendFunc );

    linkClickController = function( href ) {
      sendFunc( { load: href } );
    };

    // sendFunc( 'child sending to parent' );

  }, function( parentMessage ) {

    // console.log( parentMessage );

  });

}


function _onHeightChange( cb ) {

  var height = _getHeight();

  cn.addEvent( window, 'resize', function() {

    var newHeight = _getHeight();

    if ( newHeight == height ) return;

    height = newHeight;

    cb( { height: height } );

  } );

  cb( { height: height } );

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

function _getHeight() {
  
  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
  return document.getElementsByTagName('body')[0].offsetHeight;

}