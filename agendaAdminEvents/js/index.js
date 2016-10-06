"use strict";

var du = require( 'dom-utils' ),

deepExtend = require( 'deep-extend' ),

React = require( 'react' ),

AdminEventsHeader = require( './AdminEventsHeader.jsx' ),

params = {
  lang: 'en',
  res: {
    terms: '#',
    location: '#',
    contributor: '#',
    addEvent: '#'
  },
  selectors: {
    headerCanvas: '.js_header_canvas',
    headControls: {
      link: '.js_head_link',
      body: '.js_head_body'
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

  _toggler( params.selectors.headControls.link, params.selectors.headControls.body );

} );

// show grouped actions on link click
function _toggler( link, body ) {

  var links = du.els( link ), bodies = du.els( body );

  du.forEach( links, function( link, activeIndex ) {

    du.addEvent( link, 'click', function( e ) {

      var enabledIndex = du.hasClass( link, 'current' ) ? -1 : activeIndex;

      e.preventDefault();

      du.forEach( links, function( l, i ) {

        du[ i === enabledIndex ? 'addClass' : 'removeClass' ]( l, 'current' );

        du[ i === enabledIndex ? 'removeClass' : 'addClass' ]( bodies[ i ], 'display-none' );

      } );

    } );

  } );

}