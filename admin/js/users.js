var userApp = require( './userApp' );

window.hook( function( ) {

  userApp( document.getElementsByTagName('body')[0] );


} );