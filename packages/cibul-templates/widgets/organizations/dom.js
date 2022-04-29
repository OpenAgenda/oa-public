"use strict";

var cn = require( '../../js/lib/common' ),

log = require( 'debug' )( 'organizations dom' ),

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

    cn.forEach( data.organizations, function( org ) {

      var catWrapper = document.createElement( 'ul' ),

      catElem;

      catWrapper.innerHTML = itemTemplate( org );

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
