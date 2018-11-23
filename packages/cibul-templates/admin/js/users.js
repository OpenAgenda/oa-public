import userApp from './userApp';

window.hook( function() {

  userApp( document.getElementsByClassName('app')[0] );

} );
