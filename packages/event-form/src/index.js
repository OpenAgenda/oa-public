import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import extractLanguages from './utils/extractLanguages';
import getMultilingualFieldNames from './utils/getMultilingualFieldNames';
import identifyLanguageChanges from './utils/identifyLanguageChanges';
import transferMultilingualValues from './utils/transferMultilingualValues';
import removeMultilingualValues from './utils/removeMultilingualValues';
import schemaLanguages from './utils/schemaLanguages';

import errorLabels from '@openagenda/labels/event/errors';

const eventFormComponents = {
  age: require( './components/Age' ),
  registration: require( './components/Registration' ),
  keywords: require( './components/Keywords' ),
  timings: require( './components/Timings' ),
  location: require( './components/Location' ),
  languages: require( './components/Languages' ),
  accessibility: require( './components/Accessibility' ),
  references: require( './components/References' )
}

const eventSchema = require( './schema' );

export default class EventForm extends Component {

  constructor( props ) {

    super( props );

    const languages = extractLanguages( this.props.values );

    const { schema, hash } = this.buildEventSchema( languages, props );

    const values = ih( props.values, {
      languages: {
        $set: schemaLanguages.getFromSchemaAndValues( schema, props.lang, languages )
      }
    } );

    this.state = { values, schema, hash, files: [], loading: false };

  }

  onChange( { values, errors, files, loading, globalError } ) {

    const { lang } = this.props;

    const languageChanges = identifyLanguageChanges(
      _.get( this.state, 'values.languages' ), // before
      _.get( values, 'languages' ) // now
    );

    const update = {
      errors,
      globalError,
      files,
      loading
    };

    if ( values ) update.values = values;

    const multilingualFieldNames = getMultilingualFieldNames( eventSchema( { languages: true } ) );

    // if a unique language has been switcheds, content should not be lost
    if ( languageChanges.swapped.length ) {

      update.values = ih( transferMultilingualValues(
        this.state.values,
        multilingualFieldNames,
        _.get( this, 'state.values.languages.0' ),
        _.first( languageChanges.swapped )
      ), {
        languages: {
          $set: [ languageChanges.swapped[ 0 ] ]
        }
      } );

    } else if ( languageChanges.removed.length ) {

      update.values = ih( removeMultilingualValues(
        this.state.values,
        multilingualFieldNames,
        languageChanges.removed
      ), {
        languages: {
          $set: this.state.values.languages.filter( l => !languageChanges.removed.includes( l ) )
        }
      } );

    }

    if ( languageChanges.has ) {

      _.assign( update, this.buildEventSchema( _.get( values, 'languages' ) ) );

      update.values.languages = schemaLanguages.getFromSchemaAndValues(
        update.schema,
        lang,
        update.values.languages
      );

    }

    if ( this.props.devOnChange ) this.props.devOnChange( update );

    return this.setState( update );

  }

  buildEventSchema( languages, props = null ) {

    const p = props || this.props;

    return {
      schema: eventSchema( {
        interfaceLanguage: p.lang,
        suggestionsRes: p.suggestionsRes,
        referencesRes: p.referencesRes,
        locationRes: p.locationRes,
        languages,
        fileStore: p.fileStore,
        schemaExtensions: p.schemaExtensions
      } ),
      hash: JSON.stringify( languages ) // only language changes may trigger schema changes
    }

  }

  render() {

    const {
      lang,
      actionComponents,
      onSubmitSuccess,
      classNames,
      role
    } = this.props;

    const {
      values,
      schema,
      hash
    } = this.state;

    return <FormSchemaComponent
      role={role}
      stateless={true}
      lang={lang}
      components={eventFormComponents}
      values={values}
      errors={this.state.errors}
      globalError={this.state.globalError}
      loading={this.state.loading}
      files={this.state.files}
      onChange={this.onChange.bind( this )}
      schema={schema}
      hash={hash}
      classNames={ih( classNames, {
        field: { $set: 'padding-v-sm form-group' }
      } )}
      actionComponents={actionComponents}
      onSubmitSuccess={onSubmitSuccess}
      labels={{
        errors: errorLabels
      }}
    />

  }

}

