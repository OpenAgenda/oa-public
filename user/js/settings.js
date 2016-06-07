var App = require( 'users/react' ),

  deepExtend = require( 'deep-extend' ),

  params = {
    lang: 'fr',
    selectors: {
      canvas: '.js_canvas'
    },
    prefix: '/settings' // IMPORTANT url for prefix redux router
  };


window.hook( function( options ) {

  deepExtend( params, options );

  App( {
    canvas: params.selectors.canvas,
    prefix: params.prefix
  } );

} );