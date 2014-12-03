var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'activeFilter dom' ),

params = {
  selectors: {
    itemsCanvas: 'ul'
  }
},

templates = {
  main : require( './main.ejs' ),
  item : require( './item.ejs' )
};

module.exports = function( anchorElem ) {

  var onRemove, // callback

  init = function() {

    return {
      render: render,
      setOnRemove: setOnRemove // set callback to call when remove request is set
    }

  },

  render = function( data ) {

    var wrapper = document.createElement( 'div' ), 

    itemsCanvas;

    _clear();

    if ( !data.filters || !data.filters.length ) {

      return;

    }

    wrapper.innerHTML = new EJS( { text: templates.main } ).render( data );

    itemsCanvas = cn.el( wrapper, params.selectors.itemsCanvas );

    cn.forEach( data.filters, function( filter ) {

      itemsCanvas.appendChild( _createFilterItem( filter ) );

    } );

    anchorElem.appendChild( cn.childObject( wrapper, 0 ) );

  },

  setOnRemove = function( cb ) {

    onRemove = cb;

  },

  _createFilterItem = function( filter ) {

    var itemWrapper = document.createElement( 'ul' ),

    filterElem;

    itemWrapper.innerHTML = new EJS( { text: templates.item }).render( filter );

    filterElem = cn.el( itemWrapper, 'li' );

    cn.addEvent( cn.el( filterElem, 'a' ), 'click', function( e ) {

      log( 'click' );

      cn.preventDefault( e );

      onRemove( filter ); // handle this in widget

    });

    return filterElem;

  },

  _clear = function() {

    var child;

    while( child = cn.childObject( anchorElem, 0) ) {

      anchorElem.removeChild( child );

    }

  }

  return init();

}