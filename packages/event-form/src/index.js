"use strict";

import React from 'react';

import FormSchemaComponent from '@openagenda/form-schemas/client/build';

const eventFormComponents = {
  age: require( './components/Age' ),
  registration: require( './components/Registration' ),
  keywords: require( './components/Keywords' ),
  timings: require( './components/Timings' ),
  locationUid: require( './components/Location' )
}

const eventSchema = require( './eventSchema' );

export default props => <FormSchemaComponent
  lang={props.lang}
  components={eventFormComponents}
  values={props.values}
  schema={eventSchema}
  actionComponents={props.actionComponents}
/>