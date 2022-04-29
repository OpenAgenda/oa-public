var cn = require( '../../js/lib/common' ),

log = require( 'debug' )( 'categories dom' ),

styler = require( '../lib/widgetStyler' ),

templates = {
  main: require( './main.ejs' ),
  item : require( './item.ejs' ),
  bsMain: require( './bsMain.ejs' ),
  bsItem: require( './bsItem.ejs' )
};

import style from './style.css';

module.exports = function( anchorElem ) {

  var _onSelect = false, _onUnselect = false,

  mainTemplate = templates.main,

  itemTemplate = templates.item,

  init = function() {

    return {
      render: render,
      setMode: setMode,
      setOnSelect: setOnSelect,
      setOnUnselect: setOnUnselect,
      setDefaultStyle: setDefaultStyle
    }

  },

  setMode = function( mode ) {

    if ( mode == 'bs' ) {

      mainTemplate = templates.bsMain;

      itemTemplate = templates.bsItem;

    }

  },

  render = function( data ) {

    anchorElem.innerHTML = mainTemplate( data );

    cn.forEach( data.categories, function( category ) {

      var catWrapper = document.createElement( 'ul' ),

      catElem;

      catWrapper.innerHTML = itemTemplate( category );

      catElem = cn.el( catWrapper, 'li' );

      cn.addEvent( catElem, 'click', function( e ) {

        log( 'click' );

        cn.preventDefault( e );

        if ( !data.enabled ) {

          log( 'click ignored: widget is not enabled' );

          return;

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
