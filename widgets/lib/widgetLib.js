var cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'widgetLib' );


/**
 * for each element corresponding to selector, load config in attribute
 * and handover the element and the config to the callback
 * callback should be the widget
 */

exports.forEachAnchor = function( selector, options, cb ) {

  // do it asap
  _onAsapReady( _load( selector, options, cb ) );

  // at latest, do it if dom is ready
  _domReady( _load( selector, options, cb ) );

};

function _load( selector, options, cb ) {

  return function() {

    cn.forEach( cn.els( selector ), function( elem ) {
      
      if ( !_flagged( elem ) ) {

        cb( elem, cn.extend( {
          anchorConfig: readAnchorConfig( elem )
        }, options ) );

      }

    } );

  }


}

/**
 * bootstrap widget with default controller interface functions
 */

exports.interface = function( name, uid, cbs ) {

  return cn.extend({
    name: name,
    uid: uid,
    clear: isNotDefined( 'clear', name ),
    include: isNotDefined( 'include', name ),
    enable: isNotDefined( 'enable', name ),
    disable: isNotDefined( 'disable', name ),
    change: isNotDefined( 'change', name )
  }, cbs );

}

function _flagged( elem ) {

  if ( elem.hasAttribute( 'data-flag' ) ) {

    return true;

  }

  elem.setAttribute( 'data-flag', '1' );

  return false;

}

function isNotDefined( type, name ) {

  return function() {}

}

function readAnchorConfig( elem ) {

  if ( elem.hasAttribute( 'data-cbctl' ) ) {

    return elem.getAttribute('data-cbctl').split('|');

  } else if ( elem.hasAttribute( 'src') ) {

    return elem.getAttribute( 'src' );

  }

}

function _domReady( cb ) {

  if (document.readyState === "complete") {

    cb();

  } else {

    cn.addEvent( window, 'load', cb );

  }

}

function _onAsapReady( timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( cn.el( 'body' ) ) return cb();

  setTimeout( function() {

    _onAsapReady( Math.max( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

}