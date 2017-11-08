"use strict";

var du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

params = {
  lang: 'en',
  uploadRes: '#upload',
  selectors: {
    canvas: '.js_canvas'
  },
  useTags: false // display tags menu & category additional fields
},

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

App = require( './App.jsx' );

window.asap( function( options ) {

  deepExtend( params, options );

  ReactDom.hydrate( <App
    lang={params.lang}
    tagSet={params.tagSet}
    categorySet={params.categorySet}
    uploadRes={params.uploadRes} 
    extraFeatures={params.useTags} />, 
  du.el( params.selectors.canvas ) );

} );