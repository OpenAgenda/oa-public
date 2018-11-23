import React, { Component } from 'react';

import TimingsPicker from 'react-timings-picker';

import timingsLabels from '@openagenda/labels/event/timings';
import flattenLabels from '@openagenda/labels/flatten';


module.exports = class TimingsComponent extends Component {

  render() {

    const {
      lang
    } = this.props;

    const labels = flattenLabels( timingsLabels, lang );

    return <TimingsPicker
        info={labels.noTiming}
        lang={({
            fr: 'fr-FR',
            en: 'en-US'
        })[ lang ]}
        startTime="7:00"
        timings={(this.props.value || [] ).map( t => ( { start: t.begin, end: t.end } ) )}
        endTime="7:00"
        activeDays={[]}
        weekStartDay={1}
        defaultDisplayWeekDay={null}
        onTimingsChange={ timings => this.props.onChange( timings.map( t => ( { begin: t.start, end: t.end } ) ) )}
        readOnly={false}
        additionalLanguages={[]}
        timingStep={30}
      />

  }

}
