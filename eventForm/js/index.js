"use strict";

var formUtils = require( './formUtils' ),

rUtils = require( './reactUtils' ),

du = require( '../../js/lib/domUtils' ),

EventForm = require( './EventForm.jsx' ),

React = require( 'react' ),

defaults = {
  language: 'fr',
  canvas: '.js_form_canvas',
  events : {
    fetch: 'eventfetch',
    fetchLanguages: 'languagesfetch', // must be dyslexia.
    description: 'edescriptionfieldsend',
    customFields: 'ecustomfieldssend',
  },
  custom: false
};

// legacy
window.oaEvent = require( './legacy/cibulEvent' );
window.oaEventAgenda = require( './legacy/cibulEventAgenda' );
window.oaEventLocation = require( './legacy/cibulEventLocation' );


// the form page is loaded by sf.
window.oaEventForm = function( options ) {

  var params = rUtils.extend( {}, defaults, options ? options : {} );

  rUtils.eh.trigger( params.events.fetch, function( eventData ) {

    React.render( <EventForm
      initialLanguages= { formUtils.extractLanguages( eventData ) }
      initData= {eventData}
      language= {params.language}
      onTextChange= {onTextChange}
      onCustomChange= {onCustomChange}
      custom= {params.custom}
      labels= {params.labels} />, 
      rUtils.createCanvas( rUtils.el( params.canvas ) )
    );

  });

  function onTextChange( field, content ) {

    rUtils.eh.trigger( params.events.description, {
      name: field,
      value: content
    } );

  }

  function onCustomChange( values, errors ) {

    rUtils.eh.trigger( params.events.customFields, {
      values: values,
      errors: errors
    } );

  }

}