"use strict";

var cn = require( '../../js/lib/common/common.mod' ),

modalPartial = require( '../../bsLayout/js/modalPartial' );

window.hook( function( options ) {

  modalPartial( cn.els( '.js_modal' ) );

});