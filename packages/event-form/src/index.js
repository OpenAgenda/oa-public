"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import extractLanguages from './utils/extractLanguages';
import getMultilingualFieldNames from './utils/getMultilingualFieldNames';
import identifyLanguageChanges from './utils/identifyLanguageChanges';
import transferMultilingualValues from './utils/transferMultilingualValues';

import errorLabels from '@openagenda/labels/event/errors';

const eventFormComponents = {
  age: require( './components/Age' ),
  registration: require( './components/Registration' ),
  keywords: require( './components/Keywords' ),
  timings: require( './components/Timings' ),
  locationUid: require( './components/Location' ),
  languages: require( './components/Languages' ),
  accessibility: require( './components/Accessibility' ),
  references: require( './components/References' )
}

const eventSchema = require( './schema' );

export default class EventForm extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      values: ih( this.props.values, { 
        languages: { 
          $set: extractLanguages( this.props.values, this.props.lang )
        } 
      } ),
      files: []
    };

    this.onChange = this.onChange.bind( this );

  }

  onChange( { values, errors, files } ) {

    const updates = {};

    const changedLanguages = values ? identifyLanguageChanges( 
      this.state.values.languages,
      values.languages
    ).changedLanguages : [];

    if ( changedLanguages.length ) {

      // need to update multilingual values AND languages field

      this.setState( {
        values: ih( transferMultilingualValues( 
          this.state.values,
          getMultilingualFieldNames( eventSchema( { 
            languages: true
          } ) ),
          _.get( this, 'state.values.languages.0' ),
          _.first( changedLanguages )
        ), {
          languages: {
            $set: [ changedLanguages[ 0 ] ]
          }
        } ), 
        errors
      } );

    } else if ( !values ) {

      this.setState( { errors, files } );

    } else {

      this.setState( { values, errors, files } );

    }

  }

  buildEventSchema() {

    return eventSchema( {
      referencesRes: this.props.referencesRes,
      locationRes: this.props.locationRes,
      languages: this.state.values.languages,
      fileStore: this.props.fileStore,
      schemaExtensions: this.props.schemaExtensions 
    } );

  }

  render() {

    const {
      lang,
      values,
      actionComponents,
      onSubmitSuccess,
      classNames
    } = this.props;

    return <FormSchemaComponent
      stateless={true}
      lang={lang}
      components={eventFormComponents}
      values={this.state.values}
      errors={this.state.errors}
      files={this.state.files}
      onChange={this.onChange}
      schema={this.buildEventSchema()}
      classNames={ih( classNames, {
        field: { $set: 'padding-v-sm' }
      } )}
      actionComponents={actionComponents}
      onSubmitSuccess={onSubmitSuccess}
      labels={{
        errors: errorLabels
      }}
    />

  }

}

