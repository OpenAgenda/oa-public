import _ from 'lodash';
import React, { Component } from 'react';
import TimingsPicker, { classNames } from '@openagenda/react-timingspicker';

function loadTimings(props) {
  return (props.value || _.get(props, 'field.default') || [])
    .map(t => ({
      begin: new Date(`${t.begin.date}T${t.begin.hours}:${t.begin.minutes}${_timezone(t.begin)}`),
      end: new Date(`${t.end.date}T${t.end.hours}:${t.end.minutes}${_timezone(t.end)}`)
    }));
};

function addDays(initial, days) {
  const date = new Date(initial);
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = class TimingsComponent extends Component {
  static defaultProps = {
    value: null,
    field: {}
  };

  static getDerivedStateFromProps(props) {
    const partialState = {
      lang: props.lang
    };

    partialState.value = loadTimings(props);

    partialState.allowedTimings = _.get(props, 'field.enabledRanges')
      ? props.field.enabledRanges.map(v => ({
        begin: v.begin,
        end: v.end.includes('T')
          ? v.end
          : `${v.end}T23:59:59.999`
      }))
      : null;

    return partialState;
  }

  state = {
    value: null
  };

  onTimingsChange = (timings = [], beginKey = 'begin') => {
    this.props.onChange(timings.map(t => ({
      begin: {
        date: _extractDateString(t[beginKey]),
        hours: _fZ(t[beginKey].getHours()),
        minutes: _fZ(t[beginKey].getMinutes())
      },
      end: {
        date: _extractDateString(t.end),
        hours: _fZ(t.end.getHours()),
        minutes: _fZ(t.end.getMinutes())
      }
    })));
  }

  render() {
    const { value, lang, allowedTimings } = this.state;

    return (
      <TimingsPicker
        onChange={this.onTimingsChange}
        value={value}
        locale={lang}
        weekStartsOn={1}
        allowedTimings={allowedTimings}
        classNames={classNames.bootstrap3}
      />
    );
  }
};

function _extractDateString(d) {
  return [
    d.getFullYear(),
    _fZ(d.getMonth() + 1),
    _fZ(d.getDate())
  ].join('-');
}

function _fZ(n) {
  return (n < 0 ? '-' : '') + (Math.abs(n) < 10 ? '0' : '') + Math.abs(n);
}

// safari requires timezone
function _timezone({ date, hours, minutes }) {
  const tzh = (new Date(date + 'T' + hours + ':' + minutes)).getTimezoneOffset() / 60;

  return (tzh > 0 ? '' : '+') + _fZ(-tzh) + ':00';
}
