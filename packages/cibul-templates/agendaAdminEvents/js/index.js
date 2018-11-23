"use strict";

const deepExtend = require( 'deep-extend' );
const React = require( 'react' );
const ReactDom = require( 'react-dom' );

const du = require( '@openagenda/dom-utils' );

const AdminEventsHeader = require( './AdminEventsHeader' );
const removeEventWarning = require( './removeEventWarning' );

const spreadsheet = require( '../../agenda/js/spreadsheet' );

const params = {
  lang: 'en',
  languages: [],
  res: {
    terms: '#',
    location: '#',
    contributor: '#',
    addEvent: '#',
    agenda: '#',
    setImage: '#',
    cleatImage: '#'
  },
  selectors: {
    headerCanvas: '.js_header_canvas',
    headControls: {
      link: '.js_head_link',
      body: '.js_head_body'
    },
    removeEvent: '.js_remove_link'
  },
  image: '#'
};


window.hook( function( options ) {

  deepExtend( params, options );

  ReactDom.render( <AdminEventsHeader
    terms={params.terms}
    lang={params.lang}
    res={params.res} />, du.el( params.selectors.headerCanvas ) );

  _toggler( params.selectors.headControls.link, params.selectors.headControls.body );

  removeEventWarning( du.el( params.selectors.headerCanvas ), du.els( params.selectors.removeEvent ), params.lang );

  spreadsheet( {
    lang: params.lang,
    languages: params.languages
  } );

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
