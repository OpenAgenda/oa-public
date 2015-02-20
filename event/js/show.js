"use strict";

var eventMap = require( './map' ),

cn = require( '../../js/lib/common/common.mod' ),

adminControls = require( './adminControls' ),

modalPartial = require( '../../bsLayout/js/modalPartial' );

window.hook( function( options ) {

  adminControls.hide();

  window.getSession( function( session ) {

    adminControls( session, options );

  });
  
  eventMap();

  modalPartial( cn.el( '.js_import_action' ) );

});