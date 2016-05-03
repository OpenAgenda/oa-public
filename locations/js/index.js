"use strict";

var du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

params = {
  lang: 'en',
  res: {
    index: '#'
  },
  selectors: {
    canvas: '.js_canvas'
  },
  useTags: false // display tags menu & category additional fields
},

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

LocactionsAdmin = require( '../../node_modules/agenda-locations/components/build/AgendaAdminLocations' );

window.hook( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <LocactionsAdmin
    agenda={params.agenda}
    settings={params.settings}
    lang={params.lang}
    detailedInfo={true}
    res={params.res} />, 
  du.el( params.selectors.canvas ) );

} );