"use strict";

var utils = require( 'utils' );

module.exports = {
  el: el,
  els: els,
  addEvent: addEvent,     // add an event to an element 
  removeEvent: removeEvent,
  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
  asapReady: asapReady, // executes cb as soon as elem targetted by elem ( or body by default ) exists.
  loadInLocation: loadInLocation,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  forEach: forEach,
  childObject: childObject,
  preventDefault: preventDefault,
  isElement: isElement,
  nl2br: nl2br,
  getScrollOffsets: getScrollOffsets,
  windowInnerHeight: windowInnerHeight
}

function isElement( o ) {

  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );

}

function preventDefault( event ) {

  event.preventDefault ? event.preventDefault() : event.returnValue = false;

};

function childObject(elem, index) {

  var i = 0, realI = 0;

  while (elem.childNodes[i]) {

    if (elem.childNodes[i].nodeType == 1) {

      if (realI==index) return elem.childNodes[i];

      realI++;
    }

    i++;

  }

  return false;

}


function hasClass( element, cls ) {

  return ( ' ' + element.className + ' ').indexOf(' ' + cls + ' ' ) > -1; 

}

function addClass( element, className ) {

  if (!hasClass(element, className)) element.className = element.className + ' ' + className; 

}

function removeClass( element, cls ) {

  if ( hasClass( element, cls ) ) {

    var regex = new RegExp(cls, 'g');

    element.className = element.className.replace(regex,'');

  } 

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

function asapReady( selector, timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = selector;

    timeout = 0;

    selector = 'body'

  } else if ( arguments.length == 2 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( el( selector ) ) return cb();

  setTimeout( function() {

    asapReady( selector, Math.min( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

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


function removeEvent( elem, types, eventHandle ) {

  if ( elem === null || elem === undefined ) return;

  if ( typeof types == 'string' ) types = [ types ];

  forEach( types, function( type ) {

    if ( elem.removeEventListener ) {
    
      elem.removeEventListener( type, eventHandle, false );
    
    } else if ( elem.detachEvent ) {
    
      elem.detachEvent( 'on'+type, eventHandle );
    
    } else {
    
      elem[ "on"+type ]=null;
    
    }

  });

};


function forEach( array, action ) {

  for ( var i = 0; i < array.length; i++ ) {

    action( array[ i ] );

  }

}

function getElementsByClassName( node, className ) {

  if ( typeof node == 'string' ) {

    className = node;
    node = document;

  }

  var a = [],

  re = new RegExp( '(^| )' + className + '( |$)' ),

  els = node.getElementsByTagName( '*' );

  for( var i=0, j=els.length; i<j; i++ ) {

    if ( re.test( els[i].className ) ) {

      a.push( els[i] );

    }

  }

  return a;

}


function nl2br( str, is_xhtml ) {

  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');

}


function windowInnerHeight( w, d ) {

  if ( !w ) {
    w = window;
    d = document;
  }

  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName('body')[0].clientHeight;

}

function getScrollOffsets( w ) {

  // Use the specified window or the current window if no argument 
  w = w || window;

  // This works for all browsers except IE versions 8 and before
  if (typeof w.pageXOffset !== 'undefined') return {
    x: w.pageXOffset,
    y:w.pageYOffset
  };

  // For IE (or any browser) in Standards mode
  var d = w.document;
  if (document.compatMode == "CSS1Compat") {
    return {
      x:d.documentElement.scrollLeft,
      y:d.documentElement.scrollTop
    };
  }

  // For browsers in Quirks mode
  return {
    x: d.body.scrollLeft,
    y: d.body.scrollTop
  };

}