"use strict";

var modalPartial = require( '../../bsLayout/js/modalPartial' ),

ownershipForm = require( './ownershipForm.ejs' ),

domUtils = require( '../../js/lib/domUtils' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

defaults = {
  selector: '.js_ownership_transfer'
};

module.exports = function() {

  var elem = domUtils.el( defaults.selector ),

  html = new EJS({ text: ownershipForm }).render( {
    res: elem.getAttribute( 'data-res' )
  } );

  modalPartial( elem, { html: html } );

}