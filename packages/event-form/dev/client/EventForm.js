import React, { Component } from 'react';

import EventForm from '../../src';

export default class DevEventForm extends Component {

  render() {

    return <EventForm
      schemaExtensions={this.props.schemaExtensions}
      locationRes="/locations"
      referencesRes="/references"
      suggestionsRes="/references"
      lang="de"
      classNames={{
        fieldsCanvas: 'padding-all-md wsq',
        bottomErrorsCanvas: 'error-summary padding-all-md',
        bottomActionsCanvas: 'padding-all-md wsq'
      }}
      values={{
        accessibility: { hi: true, sl: true },
        references: [ 45527593 ],
        timings: [ {
          begin: {
            date: '2018-11-27',
            hours: 10,
            minutes: 10
          },
          end: {
            date: '2018-11-27',
            hours: 16,
            minutes: 16
          }
        } ]
      }}
    />

  }

}
