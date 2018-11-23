import React from 'react';
import ReactDom from 'react-dom';
import deepExtend from 'deep-extend';
import formUtils from './formUtils';
import rUtils from './reactUtils';
import EventForm from './EventForm.jsx';
import labels from '@openagenda/labels/event/form';
import formConfiguration from './formConfiguration';

const fieldErrors = [];

const defaults = {
  order: [ {
    field: 'title'
  } ],
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
    location: 'elocationsend',
    references: 'ereferences'
  },
  custom: false,
  labels: labels,
  translation: false
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
      order={ params.order }
      configuration= { formConfiguration( params.configuration ? params.configuration : {}, { lang: params.language } ) }
      contributionConfiguration= { params.contributionConfiguration }
      agendaUid= { params.agendaUid }
      initialLanguages= { initialLanguages }
      defaultFormLanguage= { params.defaultFormLanguage }
      useWysiwyg= {params.useWysiwyg}
      initData= {eventData}
      lang= {params.language}
      onTextChange= {onTextChange}
      onCustomChange= {onCustomChange}
      onTimingsChange= {onTimingsChange}
      onAgendaDataChange= {onAgendaDataChange}
      onLocationChange= {onLocationChange}
      onReferencesChange= {onReferencesChange}
      custom= {params.custom}
      customRes={params.customRes}
      locationRes={params.locationRes}
      enableGeocode={params.enableGeocode}
      referenceRes={params.referenceRes}
      categories={params.categories}
      categorySet={params.categorySet}
      tags={params.tags}
      tagSet={params.tagSet}
      labels= {params.labels}
      initTranslation= {params.translation} />,
      rUtils.el( params.canvas )
    );

  });

  return EventForm.actionables;

  function onAgendaDataChange( data ) {

    rUtils.eh.trigger( params.events.agenda, data );

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

  function onReferencesChange( values ) {

    rUtils.eh.trigger( params.events.references, values );

  }

}
