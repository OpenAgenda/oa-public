"use strict";

var du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

React = require( 'react' ),

AdminEventsHeader = require( './AdminEventsHeader.jsx' ),

params = {
  lang: 'en',
  res: {
    terms: '#'
  },
  selectors: {
    headerCanvas: '.js_header_canvas'
  }
},

ReactDom = require( 'react-dom' );

window.asap( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <AdminEventsHeader
    lang={params.lang}
    res={params.res} />, du.el( params.selectors.headerCanvas ) );

} );