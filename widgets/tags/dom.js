var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'tag dom' ),

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

    cn.forEach( data.tags, function( tag ) {

      var tagWrapper = document.createElement( 'ul' ),

      tagElem;

      tagWrapper.innerHTML = new EJS( { text: templates.item } ).render( tag );

      tagElem = cn.el( tagWrapper, 'li' );

      cn.addEvent( tagElem, 'click', function( e ) {

        log( 'click' );

        cn.preventDefault( e );

        if ( !data.enabled ) {

          log( 'click ignored: widget is not enabled' );

          return;

        }

        if ( !tag.active ) {

          log( 'tag not active' );

        }

        if ( tag.selected ) {

          _unselect( tag );

        } else {

          _select( tag );

        }

      });

      cn.el( anchorElem, 'ul' ).appendChild( tagElem );

    } );

  },

  setDefaultStyle = function() {

    styler( style );

  },

  setOnSelect = function( cb ) {

    _onSelect = cb;

  },

  setOnUnselect = function( cb ) {

    _onUnselect = cb;

  },

  _select = function( tag ) {

    log( 'tag %s is selected', tag.label );

    if ( _onSelect ) _onSelect( tag );

  },

  _unselect = function( tag ) {

    log( 'tag %s is unselected', tag.label );

    if ( _onUnselect ) _onUnselect( tag );

  };

  return init();

}