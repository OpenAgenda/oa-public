import _ from 'lodash';

import React, { Component } from 'react';

import TimingsPicker from 'react-timings-picker';

import timingsLabels from '@openagenda/labels/event/timings';
import flattenLabels from '@openagenda/labels/flatten';

import getTimingsSpan from '../utils/getTimingsSpan';

const sevenDays = 604800000; // 7*24*60*60*1000


module.exports = class TimingsComponent extends Component {

  loadTimings() {

    const value = _.get( this.props, 'value' );

    return ( value || _.get( this.props, 'field.default', [] ) )
      .map( t => ( { start: t.begin, end: t.end } ) );

  }

  render() {

    const {
      lang,
      field
    } = this.props;

    const labels = flattenLabels( timingsLabels, lang );

    return <TimingsPicker
        info={labels.noTiming}
        lang={({
            fr: 'fr-FR',
            en: 'en-US'
        })[ lang ]}
        startTime="7:00"
        timings={this.loadTimings()}
        endTime="7:00"
        activeDays={_.get( field, 'enabledRanges', [] ).map( r => ( { startDate: r.begin, endDate: r.end } ) )}
        weekStartDay={1}
        defaultDisplayWeekDay={null}
        onTimingsChange={ timings => this.props.onChange( timings.map( t => ( { begin: t.start, end: t.end } ) ) )}
        readOnly={false}
        additionalLanguages={[]}
        timingStep={30}
        displayRecurrencer={!field.enabledRanges || ( getTimingsSpan( field.enabledRanges ) > sevenDays ) }
      />

  }

}
