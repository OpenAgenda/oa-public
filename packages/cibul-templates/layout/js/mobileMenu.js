"use strict";

var cn = require( '../../js/lib/common' ),

params = {
  selectors: {
    link: '.js_menu_button',
    items: '.js_menu_item'
  },
  classes: {
    active: 'active'
  }
}

/**
 * handle the sidebar menu in mobile mode
 */

module.exports = function() {

  var visible = false,

  linkElem = cn.el( params.selectors.link );

  cn.addEvent( linkElem, 'click', function() {

    cn.forEach( cn.els( params.selectors.items ), function( item ) {

      item.setAttribute( 'style', visible ? 'display: none;' : 'display: block;' );

    } );

    visible = !visible;

    ( visible ? cn.addClass : cn.removeClass )( linkElem, params.classes.active );

  } )

}
