import _ from 'lodash';

import React, { Component } from 'react';

import TimingsPicker from 'react-timings-picker';

import TimingsPicker2 from '@openagenda/react-timingspicker';
import timingsLabels from '@openagenda/labels/event/timings';
import flattenLabels from '@openagenda/labels/flatten';

import getTimingsSpan from '../utils/getTimingsSpan';

const sevenDays = 604800000; // 7*24*60*60*1000

function loadTimings( props, beginKey = 'begin' ) {
  return (props.value || _.get( props, 'field.default' ) || [])
    .map( t => ({
      [ beginKey ]: new Date( `${t.begin.date}T${t.begin.hours}:${t.begin.minutes}${_timezone( t.begin )}` ),
      end: new Date( `${t.end.date}T${t.end.hours}:${t.end.minutes}${_timezone( t.end )}` )
    }) );
};

function addDays( initial, days ) {
  const date = new Date( initial );
  date.setDate( date.getDate() + days );
  return date;
}


module.exports = class TimingsComponent extends Component {

  static defaultProps = {
    value: null,
    field: {}
  };

  static getDerivedStateFromProps( props, state ) {
    const componentName = _.get( props, 'field.component' );
    const partialState = {
      lang: props.lang
    };

    if ( props.lang !== state.lang ) {
      partialState.labels = flattenLabels( timingsLabels, props.lang );
    }

    partialState.value = loadTimings( props, componentName === '@openagenda/react-timingspicker' ? 'begin' : 'start' );

    partialState.allowedTimings = _.get( props, 'field.enabledRanges' )
      ? props.field.enabledRanges.map( v => ({
        begin: v.begin,
        end: _extractDateString( addDays( v.end, 1 ) )
      }) )
      : null;

    return partialState;
  }

  state = {
    value: null,
    activeWeek: new Date()
  };

  onTimingsChange = ( timings = [], beginKey = 'begin' ) => {
    this.props.onChange( timings.map( t => ({
      begin: {
        date: _extractDateString( t[ beginKey ] ),
        hours: _fZ( t[ beginKey ].getHours() ),
        minutes: _fZ( t[ beginKey ].getMinutes() )
      },
      end: {
        date: _extractDateString( t.end ),
        hours: _fZ( t.end.getHours() ),
        minutes: _fZ( t.end.getMinutes() )
      }
    }) ) );
  }

  onChangeActiveWeek = activeWeek => this.setState( { activeWeek } );

  render() {

    const { field } = this.props;
    const { value, lang, labels, activeWeek, allowedTimings } = this.state;

    switch ( field.component ) {
      case '@openagenda/react-timingspicker':
        return (
          <TimingsPicker2
            onChange={this.onTimingsChange}
            value={value}
            locale={lang}
            weekStartsOn={1}
            onChangeActiveWeek={this.onChangeActiveWeek}
            activeWeek={activeWeek}
            allowedTimings={allowedTimings}
          />
        );
      default:
        return (
          <TimingsPicker
            info={labels.noTiming}
            lang={({
              fr: 'fr-FR',
              en: 'en-US',
              de: 'de-DE',
              es: 'es-ES'
            })[ lang ]}
            startTime="6:00"
            timings={loadTimings( this.props, 'start' )}
            endTime="6:00"
            activeDays={_.get( field, 'enabledRanges', [] ).map( r => ({ startDate: r.begin, endDate: r.end }) )}
            weekStartDay={1}
            defaultDisplayWeekDay={null}
            onTimingsChange={timings => this.onTimingsChange( timings, 'start' )}
            readOnly={false}
            additionalLanguages={[]}
            timingStep={30}
            displayRecurrencer={!field.enabledRanges || (getTimingsSpan( field.enabledRanges ) > sevenDays)}
          />
        );
    }

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

  return ( n < 0 ? '-' : '' ) + ( Math.abs( n ) < 10 ? '0' : '' ) + Math.abs( n );

}

// safari requires timezone
function _timezone( { date, hours, minutes } ) {

  const tzh = (new Date( date + 'T' + hours + ':' + minutes )).getTimezoneOffset() / 60;

  return (tzh >= 0 ? '' : '+') + _fZ( -tzh ) + ':00';

}
