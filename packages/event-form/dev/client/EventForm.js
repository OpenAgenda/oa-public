import React, { Component } from 'react';

import EventForm from '../../src';

export default class DevEventForm extends Component {

  render() {

    return <EventForm
      schemaExtensions={this.props.schemaExtensions}
      locationRes="/locations"
      referencesRes="/references"
      suggestionsRes="/references"
      lang="fr"
      classNames={{
        fieldsCanvas: 'padding-all-md wsq',
        bottomErrorsCanvas: 'error-summary padding-all-md',
        bottomActionsCanvas: 'padding-all-md wsq'
      }}
      values={{
        accessibility: { hi: true, sl: true },
        references: [ 45527593 ],
        timings: [ {
          begin: new Date( '2018-11-27T15:13:00' ),
          end: new Date( '2018-11-27T16:16:00' ),
        } ]
      }}
    />

  }

}
