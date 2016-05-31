"use strict";

var modalPartial = require( '../../bsLayout/js/modalPartial' ),

ownershipForm = require( './ownershipForm.ejs' ),

utils = require( 'utils' ),

domUtils = require( '../../js/lib/domUtils' ),

i18n = require( '../../layout/js/i18n' ), __,

labels = {
  fr: require( './ownershipTransfer.fr.json' )
},

params = {
  selector: '.js_ownership_transfer'
};

module.exports = function( options ) {

  var elem;

  utils.extend( params, options || {} );

  elem = domUtils.el( params.selector );

  modalPartial( elem, { html: ownershipForm( {
    res: elem.getAttribute( 'data-res' ),
    __: i18n( labels[ params.lang ] || {} )
  } ) } );

}