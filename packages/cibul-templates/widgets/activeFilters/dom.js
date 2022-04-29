"use strict";

var cn = require( '../../js/lib/common' ),

log = require( 'debug' )( 'activeFilter dom' ),

params = {
  selectors: {
    itemsCanvas: 'ul'
  }
},

templates = {
  main : require( './main.ejs' ),
  bsMain : require( './bsMain.ejs' ),
  item : require( './item.ejs' ),
  bsItem: require( './bsItem.ejs' )
},

mainTemplate = templates.main,

itemTemplate = templates.item;

module.exports = function( anchorElem ) {

  var onRemove; // callback

  return {
    render: render,
    setOnRemove: setOnRemove, // set callback to call when remove request is set
    setMode: setMode
  };

  function render( data ) {

    var wrapper = document.createElement( 'div' ), 

    itemsCanvas;

    _clear();

    if ( !data.filters || !data.filters.length ) {

      return;

    }

    wrapper.innerHTML = mainTemplate( data );

    itemsCanvas = cn.el( wrapper, params.selectors.itemsCanvas );

    cn.forEach( data.filters, function( filter ) {

      itemsCanvas.appendChild( _createFilterItem( filter ) );

    } );

    anchorElem.appendChild( cn.childObject( wrapper, 0 ) );

  }

  
  function setOnRemove( cb ) {

    onRemove = cb;

  }


  function setMode( mode ) {

    if ( mode == 'bs' ) {

      mainTemplate = templates.bsMain;

      itemTemplate = templates.bsItem;

    }

  }


  function _createFilterItem( filter ) {

    var itemWrapper = document.createElement( 'ul' ),

    filterElem;

    itemWrapper.innerHTML = itemTemplate( filter );

    filterElem = cn.el( itemWrapper, 'li' );

    cn.addEvent( cn.el( filterElem, 'a' ), 'click', function( e ) {

      log( 'click' );

      cn.preventDefault( e );

      onRemove( filter ); // handle this in widget

    });

    return filterElem;

  }


  function _clear() {

    var child;

    while( child = cn.childObject( anchorElem, 0) ) {

      anchorElem.removeChild( child );

    }

  }

}
