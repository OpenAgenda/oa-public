"use strict";

var du = require( '@openagenda/dom-utils' ),

deepExtend = require( 'deep-extend' ),

params = {
  detailedInfo: true,
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

LocactionsAdmin = require( '@openagenda/agenda-locations/components/build/AgendaAdminLocations' );

window.hook( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <LocactionsAdmin
    enableGeocode={params.enableGeocode}
    agenda={params.agenda}
    settings={params.settings}
    lang={params.lang}
    detailedInfo={params.detailedInfo}
    res={params.res} />,
  du.el( params.selectors.canvas ) );

} );
