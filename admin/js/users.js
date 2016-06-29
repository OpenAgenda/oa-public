var userApp = require( './userApp' );

window.hook( function( ) {

  userApp( document.getElementsByClassName('app')[0] );


} );