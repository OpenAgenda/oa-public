var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'organizations dom' ),

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

    cn.forEach( data.organizations, function( org ) {

      var catWrapper = document.createElement( 'ul' ),

      catElem;

      catWrapper.innerHTML = new EJS( { text: templates.item } ).render( org );

      catElem = cn.el( catWrapper, 'li' );

      cn.addEvent( catElem, 'click', function( e ) {

        log( 'click' );

        cn.preventDefault( e );

        if ( !data.enabled ) {

          log( 'click ignored: widget is not enabled' );

          return;

        }

        if ( !org.active ) {

          log( 'organization not active. running anyways' );

        }

        if ( org.selected ) {

          _unselect( org );

        } else {

          _select( org );

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

  _select = function( organization ) {

    log( 'organization %s is selected', organization.label );

    if ( _onSelect ) _onSelect( organization );

  },

  _unselect = function( organization ) {

    log( 'organization %s is unselected', organization.label );

    if ( _onUnselect ) _onUnselect( organization );

  };

  return init();

}