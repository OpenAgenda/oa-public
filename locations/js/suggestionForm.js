"use strict";

var du = require( '@openagenda/dom-utils' ),

deepExtend = require( 'deep-extend' ),

params = {
  lang: 'en',
  locationUid: false, // required
  res: {
    getSuggestion: 'locationWithSuggestions.json',
    setSuggestion: '#',
    geocode: '#'
  },
  selectors: {
    canvas: '.js_canvas'
  },
  redirects: {
    cancel: '#',
    success: '#'
  }
},

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

SuggestionForm = require( '@openagenda/agenda-locations/components/build/SuggestionForm' );

window.hook( function( options ) {

  deepExtend( params, options );

  if ( !params.locationUid ) {

    return console.error( 'location uid is not specified' );

  }

  // deploy here.
  ReactDom.render( <SuggestionForm
    lang={ params.lang }
    locationUid={ params.locationUid }
    res={ params.res }
    redirects={ params.redirects }
  />, du.el( params.selectors.canvas ) );

} );