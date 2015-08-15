"use strict";

var qs = require( 'qs' ),

utils = require( 'utils' );

module.exports = {
  el: el,
  els: els,
  addEvent: addEvent,     // add an event to an element 
  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
  loadInLocation: loadInLocation
}


function els( node, selector ) {

  if ( typeof node == 'string' ) {

    selector = node;
    node = document;

  }

  var prefix = selector.substr( 0, 1 );

  if ( '.#,'.indexOf( prefix ) !== -1 ) {

    selector = selector.substr( 1 );

  }

  if ( prefix == '.' ) {

    return getElementsByClassName( node, selector );

  } else if ( prefix == '#') {

    var result = node.getElementById( selector );
    
    if ( result ) {

      return [ result ];

    } else {

      return [];

    }

  } else {

    return node.getElementsByTagName( selector );

  }

};

function el( node, selector ) {

  var results = els( node, selector );

  return results.length ? results[ 0 ] : null;

}


function whenReady( cb ) {

  if ( document.readyState === 'complete' ) {

    cb();

  } else {

    addEvent( window, 'load', cb );

  }

}


function loadInLocation( values ) {

  var href = window.location.href.split( '?' )[ 0 ];

  if ( utils.size( values ) ) {

    href += '?' + qs.stringify( values );

  }

  return href;

}


/**
 * cross browser add event
 */

function addEvent( elem, types, eventHandle ) {

  if ( elem == null || elem == undefined ) return;
  
  if ( typeof types == 'string' ) types = [ types ];
  
  forEach( types, function( type ) {

    if ( elem.addEventListener ) {

      elem.addEventListener( type, eventHandle, false );

    } else if ( elem.attachEvent ) {

        elem.attachEvent( 'on' + type, eventHandle );

    } else {

        elem[ 'on' + type ]=eventHandle;

    }

  } );

}

function forEach( array, action ) {

  for ( var i = 0; i < array.length; i++ ) {

    action( array[ i ] );

  }

}