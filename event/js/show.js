"use strict";

var eventMap = require( './map' ),

cn = require( '../../js/lib/common/common.mod' ),

adminControls = require( './adminControls' );

window.hook( function( options ) {

  cn.addEvent( window, 'load', function( ) {

    adminControls.hide();

    window.getSession( function( session ) {

      adminControls( session, options );

    });


  } );
  
  eventMap();

});