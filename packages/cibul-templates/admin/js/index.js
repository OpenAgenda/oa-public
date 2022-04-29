var cn = require( '../../js/lib/common' ),

totalsSection = require( './totalsSection' ),

eventsByWeek = require( './eventsByWeek' ),

eventsDiff = require( './eventsDiff' );

window.hook( function( ) {

  totalsSection();

  eventsByWeek();

  eventsDiff();

});
