"use strict";

var formUtils = require( './formUtils' ),

rUtils = require( './reactUtils' ),

du = require( '../../js/lib/domUtils' ),

deepExtend = require( 'deep-extend' ),

EventForm = require( './EventForm.jsx' ),

deepExtend = require( 'deep-extend' ),

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

formConfiguration = require( './formConfiguration' ),

labels = require( 'labels/event/form' ),

fieldErrors = [], customErrors = [],

defaults = {
  configuration: false,
  language: 'fr',
  canvas: '.js_form_canvas',
  useWysiwyg: false,
  agendaUid: false,
  categorySet: undefined,
  tagSet: undefined,
  events : {
    fetch: 'eventfetch',
    fetchLanguages: 'languagesfetch', // must be dyslexia.
    languageChange: 'elanguageschange',
    description: 'edescriptionfieldsend',
    customFields: 'ecustomfieldssend',
    single: 'esinglesend',
    timings: 'etimingssend',
    agenda: 'eagendawrite',
    location: 'elocationsend'
  },
  custom: false,
  labels: labels
};

// legacy

window.oaEvent = require( './legacy/cibulEvent' );
window.oaEventSubmit = require( './legacy/cibulEventSubmit' );
window.oaEventImage = require( './legacy/cibulEventImage' );


// the form page is loaded by sf.
window.oaEventForm = function( options ) {

  var params = deepExtend( {}, defaults, options ? options : {} );

  rUtils.eh.trigger( params.events.fetch, function( eventData ) {

    var initialLanguages = formUtils.extractLanguages( eventData );

    rUtils.eh.trigger( params.events.languageChange, initialLanguages );

    ReactDom.render( <EventForm
      configuration= { formConfiguration( params.configuration ? params.configuration : {}, { lang: params.language } ) }
      agendaUid= { params.agendaUid }
      initialLanguages= { initialLanguages }
      useWysiwyg= {params.useWysiwyg}
      initData= {eventData}
      lang= {params.language}
      onTextChange= {onTextChange}
      onCustomChange= {onCustomChange}
      onTimingsChange= {onTimingsChange}
      onChangeLanguages= {onChangeLanguages}
      onAgendaDataChange= {onAgendaDataChange}
      onLocationChange= {onLocationChange}
      custom= {params.custom}
      customRes={params.customRes}
      locationRes={params.locationRes}
      categories={params.categories}
      categorySet={params.categorySet}
      tags={params.tags}
      tagSet={params.tagSet}
      labels= {params.labels} />, 
      rUtils.el( params.canvas )
    );

  });

  function onAgendaDataChange( data ) {

    rUtils.eh.trigger( params.events.agenda, data );

  }

  function onChangeLanguages( languages ) {

    rUtils.eh.trigger( params.events.languageChange, languages );

  }

  function onTimingsChange( newTimings ) {

    rUtils.eh.trigger( params.events.timings, newTimings );

  }

  function onLocationChange( newLocation ) {

    rUtils.eh.trigger( params.events.location, newLocation );

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