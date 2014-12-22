var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'categories dom' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

templates = {
  main: require( './main.ejs' ),
  item : require( './item.ejs' )
};

module.exports = function( anchorElem ) {

  var _onSelect = false, _onUnselect = false,

  init = function() {

    return {
      render: render,
      setOnSelect: setOnSelect,
      setOnUnselect: setOnUnselect,
      setDefaultStyle: setDefaultStyle
    }
    
  },

  render = function( data ) {

    anchorElem.innerHTML = new EJS( { text: templates.main } ).render( data );

    cn.forEach( data.categories, function( category ) {

      var catWrapper = document.createElement( 'ul' ),

      catElem;

      catWrapper.innerHTML = new EJS( { text: templates.item } ).render( category );

      catElem = cn.el( catWrapper, 'li' );

      cn.addEvent( catElem, 'click', function( e ) {

        log( 'click' );

        cn.preventDefault( e );

        if ( !data.enabled ) {

          log( 'click ignored: widget is not enabled' );

          return;

        }

        if ( !category.active ) {

          log( 'category not active' );

        }

        if ( category.selected ) {

          _unselect( category );

        } else {

          _select( category );

        }

      });

      cn.el( anchorElem, 'ul' ).appendChild( catElem );

    } );

  },

  setOnSelect = function( cb ) {

    _onSelect = cb;

  },

  setOnUnselect = function( cb ) {

    _onUnselect = cb;

  },

  setDefaultStyle = function() {

    styler( style );

  },

  _select = function( category ) {

    log( 'category %s is selected', category.label );

    if ( _onSelect ) _onSelect( category );

  },

  _unselect = function( category ) {

    log( 'category %s is unselected', category.label );

    if ( _onUnselect ) _onUnselect( category );

  };

  return init();

}