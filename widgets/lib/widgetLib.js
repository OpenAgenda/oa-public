var cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'widgetLib' );


/**
 * for each element corresponding to selector, load config in attribute
 * and handover the element and the config to the callback
 * callback should be the widget
 */

exports.forEachAnchor = function( selector, options, cb ) {

  domReady( function() {

    cn.forEach( cn.els( selector ), function( elem ) {

      options.anchorConfig = readAnchorConfig( elem );

      cb( elem, options );

    } );

  });

};

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
    disable: isNotDefined( 'disable', name )
  }, cbs );

}

var isNotDefined = function( type, name ) {

  return function() {

    log( 'no %s function is defined for %s', type, name );

  }

}


var readAnchorConfig = function( elem ) {

  return elem.getAttribute('data-cbctl').split('|');

},

domReady = function( cb ) {

  if (document.readyState === "complete") {

    cb();

  } else {

    cn.addEvent( window, 'load', cb );

  }

}