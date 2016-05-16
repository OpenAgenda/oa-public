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
    headerCanvas: '.js_header_canvas',
    grouped: {
      link: '.js_grouped_link',
      body: '.js_grouped_body'
    },
    exports: {
      link: '.js_exports_link',
      body: '.js_exports_body'
    }
  }
},

ReactDom = require( 'react-dom' );

window.hook( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <AdminEventsHeader
    terms={params.terms}
    lang={params.lang}
    res={params.res} />, du.el( params.selectors.headerCanvas ) );

  _hidden( params.selectors.grouped.link, params.selectors.grouped.body );

  _hidden( params.selectors.exports.link, params.selectors.exports.body );

} );

// show grouped actions on link click
function _hidden( link, body ) {

  du.addEvent( du.el( link ), 'click', function( e ) {

    e.preventDefault();

    du.addClass( du.el( link ), 'display-none' );
    du.removeClass( du.el( body ), 'display-none' );

  } );

}