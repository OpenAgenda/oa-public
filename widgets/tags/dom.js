"use strict";

var EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'tag dom' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

templates = {
  main: require( './main.ejs' ),
  item : require( './item.ejs' ),
  bsMain: require( './bsMain.ejs' ),
  bsItem: require( './bsItem.ejs' )
};

module.exports = function( anchorElem ) {

  var _onSelect = false, _onUnselect = false, 

  mainTemplate = templates.main, 

  itemTemplate = templates.item;

  return {
    render: render,
    setOnSelect: setOnSelect,
    setOnUnselect: setOnUnselect,
    setDefaultStyle: setDefaultStyle,
    setMode: setMode
  }; 

  function setMode( mode ) {

    if ( mode == 'bs' ) {

      mainTemplate = templates.bsMain;

      itemTemplate = templates.bsItem;

    }

  }

  function render( data ) {

    anchorElem.innerHTML = new EJS( { text: mainTemplate } ).render( data );

    cn.forEach( data.tags, function( tag ) {

      var tagWrapper = document.createElement( 'ul' ),

      tagElem;

      tagWrapper.innerHTML = new EJS( { text: itemTemplate } ).render( tag );

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

  }

  function setDefaultStyle() {

    styler( style );

  }

  function setOnSelect( cb ) {

    _onSelect = cb;

  }

  function setOnUnselect( cb ) {

    _onUnselect = cb;

  }

  function _select( tag ) {

    log( 'tag %s is selected', tag.label );

    if ( _onSelect ) _onSelect( tag );

  }

  function _unselect( tag ) {

    log( 'tag %s is unselected', tag.label );

    if ( _onUnselect ) _onUnselect( tag );

  }

}