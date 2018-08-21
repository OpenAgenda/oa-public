"use strict";

import _ from 'lodash';
import React, { Component } from 'react';

import FormSchemaComponent from '@openagenda/form-schemas/client/build';

const eventFormComponents = {
  age: require( './components/Age' ),
  registration: require( './components/Registration' ),
  keywords: require( './components/Keywords' ),
  timings: require( './components/Timings' ),
  locationUid: require( './components/Location' )
}

const eventSchema = require( './eventSchema' );

export default class EventForm extends Component {

  render() {

    const { lang, values, actionComponents, onSubmitSuccess, locationRes } = this.props;

    const schema = eventSchema( {
      locationRes
    } );           

    return <FormSchemaComponent
      lang={lang}
      components={eventFormComponents}
      values={values}
      schema={schema}
      actionComponents={actionComponents}
      onSubmitSuccess={onSubmitSuccess}
    />

  }

}

