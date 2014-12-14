var cn = require( '../../js/lib/common/common.mod.js' ),

totalsSection = require( './totalsSection' ),

eventsByWeek = require( './eventsByWeek' ),

eventsDiff = require( './eventsDiff' );

window.hook( function( ) {
  
  cn.addEvent( window, 'load', function() {

    totalsSection();

    eventsByWeek();

    eventsDiff();

  } );


});