"use strict";

var du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

params = {
  lang: 'en',
  uploadRes: '#upload',
  selectors: {
    canvas: '.js_canvas'
  },
  useTags: false // accessible to those with the right cred
},

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

App = require( './App.jsx' );

window.asap( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <App
    lang={params.lang}
    tagSet={params.tagSet}
    categorySet={params.categorySet}
    uploadRes={params.uploadRes} 
    useTags={params.useTags}/>, 
  du.el( params.selectors.canvas ) );

} );