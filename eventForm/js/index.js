"use strict";

var formUtils = require( './formUtils' ),

rUtils = require( './reactUtils' ),

du = require( '../../js/lib/domUtils' ),

EventForm = require( './EventForm.jsx' ),

React = require( 'react' ),

defaults = {
  language: 'fr',
  canvas: '.js_form_canvas',
  useWysiwyg: false,
  events : {
    fetch: 'eventfetch',
    fetchLanguages: 'languagesfetch', // must be dyslexia.
    languageChange: 'elanguageschange',
    description: 'edescriptionfieldsend',
    customFields: 'ecustomfieldssend',
    single: 'esinglesend'
  },
  custom: false,
  labels: {
    descriptionSection: { fr: 'Descriptifs', en: 'Description fields' },
    title: { fr: 'Le titre', en: 'The title' },
    description: { fr: 'Description', en: 'Description' },
    longDescription: { fr: 'Description longue', en: 'Long description' },
    keywords: { fr: 'Mots clés', en: 'Keywords' },
    accessibility: { fr: 'Accessibilité particulière', en: 'Accessibility conditions' },
    conditions: { fr: 'Conditions', en: 'Conditions' },
    ticketLink: { fr: 'Lien de réservation', en: 'Reservation link' },
    age: { fr: 'Age du public ciblé', en: 'Targeted public age' },
    addLanguage: 'ajouter une langue',
    keywordPlaceholder: { fr: 'Ajouter un mot clé', en: 'Add a keyword' }
  }
};

// legacy
window.oaEvent = require( './legacy/cibulEvent' );
window.oaEventAgenda = require( './legacy/cibulEventAgenda' );
window.oaEventLocation = require( './legacy/cibulEventLocation' );
window.oaEventSubmit = require( './legacy/cibulEventSubmit' );
window.oaEventImage = require( './legacy/cibulEventImage' );


// the form page is loaded by sf.
window.oaEventForm = function( options ) {

  var params = rUtils.extend( {}, defaults, options ? options : {} );

  rUtils.eh.trigger( params.events.fetch, function( eventData ) {

    React.render( <EventForm
      initialLanguages= { formUtils.extractLanguages( eventData ) }
      useMarkdown= {params.useMarkdown}
      initData= {eventData}
      lang= {params.language}
      onTextChange= {onTextChange}
      onCustomChange= {onCustomChange}
      onChangeLanguages= {onChangeLanguages}
      custom= {params.custom}
      labels= {params.labels} />, 
      rUtils.el( params.canvas )
    );

  });

  function onChangeLanguages( languages ) {

    rUtils.eh.trigger( params.events.languageChange, languages );

  }

  function onTextChange( field, content ) {

    var eventName = params.events.single;

    if ( [ 'title', 'description', 'freeText', 'tags', 'conditions' ].indexOf( field ) !== -1 ) {

      eventName = params.events.description;

    }

    rUtils.eh.trigger( eventName, {
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