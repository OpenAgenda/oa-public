"use strict";

var formUtils = require( './formUtils' ),

rUtils = require( './reactUtils' ),

du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

EventForm = require( './EventForm.jsx' ),

deepExtend = require( 'deep-extend' ),

React = require( 'react' ),

fieldErrors = [], customErrors = [],

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
    descriptionSection: {
      fr: 'Descriptifs',
      en: 'Description fields'
    },
    title: {
      fr: 'Titre',
      en: 'Title'
    },
    description: {
      fr: 'Description',
      en: 'Description'
    },
    longDescription: {
      fr: 'Description longue',
      en: 'Long description'
    },
    longDescriptionPlaceholder: {
      fr: 'Saisissez une description détaillée de votre événement. \n\nVouz pouvez également ajouter des liens vers des images (.jpg ou autre). \n\nIntégrez des vidéos youtube en collant le lien de la page. ex: http://www.youtube.com/watch?v=wZZ7oFKsKzY',
      en: 'Type in a detailed description of your event. \n\nPaste in image links too (.jpg or other). \n\nEmbed youtube videos by simply pasting in the link. ex: http://www.youtube.com/watch?v=wZZ7oFKsKzY'
    },
    keywords: {
      fr: 'Mots clés',
      en: 'Keywords'
    },
    accessibility: {
      fr: 'Accessibilité particulière',
      en: 'Accessibility conditions'
    },
    conditions: {
      fr: 'Conditions',
      en: 'Conditions'
    },
    conditionsPlaceholder: {
      fr: 'Entrée libre, inscription requise, tarif, autre...',
      en: 'Free access, inscription required, pricing, other...'
    },
    ticketLink: {
      fr: 'Lien de réservation',
      en: 'Reservation link'
    },
    age: {
      fr: 'Age du public ciblé',
      en: 'Targeted public age'
    },
    uploadButton: {
      fr: 'Sélectionner',
      en: 'Select'
    },
    addLanguage: 'ajouter une langue',
    keywordPlaceholder: {
      fr: 'Ajouter un mot clé',
      en: 'Add a keyword'
    }
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

  var params = deepExtend( {}, defaults, options ? options : {} );

  rUtils.eh.trigger( params.events.languageChange, [ params.language ] );

  rUtils.eh.trigger( params.events.fetch, function( eventData ) {

    React.render( <EventForm
      initialLanguages= { formUtils.extractLanguages( eventData ) }
      useWysiwyg= {params.useWysiwyg}
      initData= {eventData}
      lang= {params.language}
      onTextChange= {onTextChange}
      onCustomChange= {onCustomChange}
      onChangeLanguages= {onChangeLanguages}
      custom= {params.custom}
      customRes={params.customRes}
      labels= {params.labels} />, 
      rUtils.el( params.canvas )
    );

  });

  function onChangeLanguages( languages ) {

    rUtils.eh.trigger( params.events.languageChange, languages );

  }

  function onTextChange( field, content, errors ) {

    fieldErrors.filter( function( e ) { return e.field !== field } );

    if ( errors ) fieldErrors.splice( 0, 0, errors );

    var eventName = params.events.single;

    if ( [ 'title', 'description', 'freeText', 'tags', 'conditions' ].indexOf( field ) !== -1 ) {

      eventName = params.events.description;

    }

    rUtils.eh.trigger( eventName, {
      name: field,
      value: content,
      errors: errors
    } );

  }

  function onCustomChange( values, errors ) {

    rUtils.eh.trigger( params.events.customFields, {
      values: values,
      errors: errors
    } );

  }

}