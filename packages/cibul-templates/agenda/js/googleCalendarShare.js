"use strict";

var utils = require( '@openagenda/utils' ),

du = require( '../../js/lib/domUtils' ),

modalPartial = require( '../../bsLayout/js/modalPartial' ),

i18n = require( '../../layout/js/i18n' ), __,

labels = {
  fr: require( './googleCalendarShare.fr.json' )
},

params = {
  lang: 'en',
  selector: '.js_google_calendar',
  template: require( './googleCalendarShare.ejs' )
};

module.exports = function( options ) {

  utils.extend( params, options || {} );

  __ = i18n( labels[ params.lang ] || {} );

  du.els( params.selector ).forEach( _displayBehavior );

}

function _displayBehavior( linkElem ) {

  modalPartial( linkElem, { html: params.template( {
    __,
    link: linkElem.getAttribute( 'href' )
  } ) } );

}