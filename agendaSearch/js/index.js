"use strict";

const defaults = {
  lang: 'en',
  selectors: {
    canvas: '.js_search_canvas'
  },
  res: '/agendas'
},

utils = require( '@openagenda/utils' ),

main = require( 'agenda-search/components/lib/main' );

window.hook( options => {

  main( utils.extend( {}, defaults, options ) );

} );