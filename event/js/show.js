"use strict";

var eventMap = require( './map' ),

cn = require( '../../js/lib/common/common.mod' ),

adminControls = require( '../../user/js/adminControls' ),

modalPartial = require( '../../bsLayout/js/modalPartial' );

window.hook( function( options ) {

  adminControls.init();

  window.getSession( function( session ) {

    adminControls( session, options );

  });
  
  eventMap();

});