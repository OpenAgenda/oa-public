"use strict";

/**
 * handling of bootstrap collapsed menus
 *
 * run once per page
 */

var cn = require('../../js/lib/common/common.mod.js'),

defaults = {
  selectors: {
    toggler: '.js_toggle'
  },
  classes: {
    display: 'in'
  },
  attributes: {
    toggle: 'data-toggle'
  }
};

module.exports = function( options ) {

  var params = cn.extend( {}, defaults, options ? options : {} );

  cn.forEach( cn.els( params.selectors.toggler ), function( togglerElem ) {

    console.log( togglerElem );

    _handleToggler( togglerElem, params );

  });

}

function _handleToggler( elem, params ) {

  var displaying = false,

  targets = cn.els( '.' + elem.getAttribute( params.attributes.toggle ) );

  cn.addEvent( elem, 'click', function( e ) {

    displaying = !displaying;

    cn.preventDefault( e );

    cn.forEach( targets, function( targetElem ) {

      ( displaying ? cn.addClass : cn.removeClass )( targetElem, params.classes.display );

    });

  });

}