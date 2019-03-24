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
      .map( t => ( {
        start: new Date( `${t.begin.date}T${t.begin.hours}:${t.begin.minutes}${_timezone( t.begin )}` ),
        end: new Date( `${t.end.date}T${t.end.hours}:${t.end.minutes}${_timezone( t.end )}` )
      } ) );

  }

  onTimingsChange( timings = [] ) {

     this.props.onChange( timings.map( t => ( {
      begin: {
        date: _extractDateString( t.start ),
        hours: _fZ( t.start.getHours() ),
        minutes: _fZ( t.start.getMinutes() )
      },
      end: {
        date: _extractDateString( t.end ),
        hours: _fZ( t.end.getHours() ),
        minutes: _fZ( t.end.getMinutes() )
      }
    } ) ) );

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
            en: 'en-US',
            de: 'de-DE'
        })[ lang ]}
        startTime="6:00"
        timings={this.loadTimings()}
        endTime="6:00"
        activeDays={_.get( field, 'enabledRanges', [] ).map( r => ( { startDate: r.begin, endDate: r.end } ) )}
        weekStartDay={1}
        defaultDisplayWeekDay={null}
        onTimingsChange={timings => this.onTimingsChange( timings )}
        readOnly={false}
        additionalLanguages={[]}
        timingStep={30}
        displayRecurrencer={!field.enabledRanges || ( getTimingsSpan( field.enabledRanges ) > sevenDays ) }
      />

  }

}


function _extractDateString( d ) {

  return [
    d.getFullYear(),
    _fZ( d.getMonth() + 1 ),
    _fZ( d.getDate() )
  ].join( '-' );

}

function _fZ( n ) {

  return ( ( n + '' ).length === 1 ? '0' : '' ) + n;

}

// safari requires timezone
function _timezone( { date, hours, minutes } ) {

  const tzh = ( new Date( date + 'T' + hours + ':' + minutes ) ).getTimezoneOffset() / 60;

  return ( tzh >= 0 ? '' : '+' ) + _fZ( - tzh ) + ':00';

}
