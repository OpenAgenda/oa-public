var App = require( '@openagenda/user-apps/dist' ),

  deepExtend = require( 'deep-extend' ),

  params = {
    lang: 'fr',
    selectors: {
      canvas: '.js_canvas'
    },
    prefix: '/settings' // IMPORTANT url for prefix react router
  };


window.hook( function( options ) {

  deepExtend( params, options );

  App( {
    canvas: params.selectors.canvas,
    prefix: params.prefix
  } );

} );
