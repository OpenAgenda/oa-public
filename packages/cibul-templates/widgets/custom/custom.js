"use strict";

exports.setOnReady = setOnReady;

var UID = 0, VALUES = 1, ACTIVECLASS = 2,

cn = require(  '../../js/lib/common' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

onReady;

if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  controller,

  enabled = false,

  selected = false,

  activeClass,

  values, selectionValues,

  unselectedValues;

  (function () {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'custom widget ' + uid );

    log( 'initing' );

    unselectedValues = {}; 

    try {

      values = JSON.parse( options.anchorConfig[ VALUES ] ); 

    } catch( e ) {

      log( 'could not parse values' );

      return;

    }

    activeClass = ( typeof options.anchorConfig[ ACTIVECLASS ] !== 'undefined' ) ?  options.anchorConfig[ ACTIVECLASS ] : 'active';

    controller = options.register( wLib.interface( 'custom', uid, {
      enable: enable,
      disable: disable,
      clear: clear
    } ));

    cn.addEvent( elem, 'click', _onClick );

    controller.onWidgetReady( 'custom', { uid } );

    if ( onReady ) onReady();

  } )();


  function enable( reqParams ) {

    selected = true;

    unselectedValues = _defineUnselected( reqParams, values );

    selectionValues = _defineSelected( reqParams, values );

    for ( var v in selectionValues ) {

      if ( ( typeof reqParams[v] == 'undefined' ) || _isDifferent( reqParams[ v ], selectionValues[v] ) ) {

        selected = false;

      }

    }


    if ( selected ) {

      cn.addClass( elem, activeClass );

    } else {

      cn.removeClass( elem, activeClass );

    }

    enabled = true;

  }

  function disable( ) {

    cn.removeClass( elem, activeClass );

  }

  function clear( ) {

    cn.removeClass( elem, activeClass );

  }

  function _onClick() {

    if ( !enabled ) {

      log( 'widget is disabled' );

      return;

    }

    controller.update( 'custom', selected ? unselectedValues : selectionValues );

  }

};

function _defineUnselected( reqParams, selectionValues ) {

  var unselectedValues = {};

  for ( var v in selectionValues ) {

    if ( ( v == 'tags' ) && reqParams.tags ) {

      unselectedValues[ v ] = _popTag( reqParams.tags, selectionValues[ v ] );

    } else {

      unselectedValues[ v ] = null;

    }

  }

  return unselectedValues;

}

function _defineSelected( reqParams, baseValues ) {

  var values = {};

  for( var v in baseValues ) {

    if ( v == 'tags' ) {

      // tags should include all tags of current request + baseValue tag
      values[ v ] = _appendTags( baseValues[ v ], reqParams.tags );

    } else {

      values[ v ] = baseValues[ v ];

    }

  }

  return values;

}

function _appendTags( tags, tagsToAppend ) {

  var tArr = [].concat( tags );

  if ( typeof tagsToAppend == 'string' ) tagsToAppend = [ tagsToAppend ];

  cn.forEach( tagsToAppend ? tagsToAppend : [], function( t ) {

    if ( tArr.indexOf( t ) == -1 ) tArr.push( t );

  });

  return tArr;

}

function _popTag( tags, tag ) {

  if ( typeof tags == 'string' ) tags = [ tags ];

  var kept = [];

  cn.forEach( tags ? tags : [], function( t ) {

    if ( t !== tag ) kept.push( t );

  });

  return kept;

}

function _isDifferent( v1, v2 ) {

  if ( !cn.isArray( v1 ) || !cn.isArray( v2 ) ) {

    return v1 !== v2;

  }

  for ( var i = v1.length - 1; i >= 0; i-- ) {
    
    if ( !cn.contains( v2, v1[ i ] ) ) return true;

  };

  for ( i = v2.length - 1; i >= 0; i-- ) {
    
    if ( !cn.contains( v1, v2[ i ] ) ) return true;
    
  };

  return false;

}

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/loader' )( {
  selector: '.cbpgcstm',
  widget: widget,
  backup: {
    selector: '[data-oacstm]',
    classNames: 'cibul-custom'
  }
} );
