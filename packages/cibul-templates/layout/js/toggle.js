"use strict";

/**
 * handling of bootstrap collapsed menus
 *
 * run once per page
 */

var cn = require('../../js/lib/common'),

defaults = {
  selectors: {
    toggler: '.js_toggle',
    toggleTrigger: '.js_toggle_trigger' // optional
  },
  classes: {
    display: 'in'
  },
  attributes: {
    toggle: 'data-toggle'
  }
};

module.exports = function( elem, options ) {

  var els = [], params;

  if ( cn.isElement( elem ) ) {

    els = [ elem ];

  } else {

    options = elem;

  }
  
  params = cn.extend( {}, defaults, options ? options : {} );

  els = els.concat( cn.els( params.selectors.toggler ) );

  cn.forEach( els, function( togglerElem ) {

    _handleToggler( togglerElem, params );

  });

}

function _handleToggler( elem, params ) {

  var attr = elem.getAttribute( params.attributes.toggle ),

  displaying = false,

  targets,

  trigger;

  if ( !attr ) return;

  elem.removeAttribute( params.attributes.toggle );

  targets = cn.els( elem, '.' + attr );

  trigger = cn.el( elem, params.selectors.toggleTrigger );

  if ( !trigger ) trigger = elem; 

  cn.addEvent( trigger, 'click', function( e ) {

    displaying = !displaying;

    cn.forEach( targets, function( targetElem ) {

      ( displaying ? _show : _hide )( targetElem, params );

    });

  });

  _controlHide( [ elem ].concat( targets ), params, function() {

    displaying = false;

  } );

}

function _controlHide( targets, params, onHide ) {

  var clicked = false;


  cn.forEach( targets, function( targetElem ) {

    cn.addEvent( targetElem, 'click', function() {

      clicked = true;

      setTimeout( function() {

        clicked = false;

      }, 10 );

    });

  } );

  cn.addEvent( cn.el( 'body'), 'click', function( e ) {

    if ( !clicked ) {

      cn.forEach( targets, function( targetElem ) {

        _hide( targetElem, params );

      } );

      onHide();

    }

  } );

}

function _show( elem, params ) {

  cn.addClass( elem, params.classes.display );

}

function _hide( elem, params ) {

  cn.removeClass( elem, params.classes.display );

}
