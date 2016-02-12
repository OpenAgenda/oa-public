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
    }
  }
},

ReactDom = require( 'react-dom' );

window.asap( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <AdminEventsHeader
    terms={params.terms}
    lang={params.lang}
    res={params.res} />, du.el( params.selectors.headerCanvas ) );

  _groupedActions();

} );

// show grouped actions on link click
function _groupedActions() {

  du.addEvent( du.el( params.selectors.grouped.link ), 'click', function( e ) {

    e.preventDefault();

    du.addClass( du.el( params.selectors.grouped.link ), 'display-none' );
    du.removeClass( du.el( params.selectors.grouped.body ), 'display-none' );

  } );

}