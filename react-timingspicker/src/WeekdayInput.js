import React, { Component } from 'react';
import * as dateFns from 'date-fns';
import WeekdayPicker from './WeekdayPicker';

export default class WeekdayInput extends Component {
  static defaultProps = {
    visible: true,
  };

  static getDerivedStateFromProps(props, state) {
    const { input, intl, weekStartsOn } = props;
    const derivedState = {};

    if (input.value !== state.selected) {
      derivedState.selected = input.value || state.selected;
    }

    if (weekStartsOn !== state.weekStartsOn) {
      derivedState.weekStartsOn = weekStartsOn;

      const weekdays = {
        long: [],
        short: [],
      };
      const startDate = dateFns.startOfWeek(new Date(), { weekStartsOn });

      for (let i = 0; i < 7; i++) {
        const day = dateFns.addDays(startDate, i);

        weekdays.long.push(intl.formatDate(day, { weekday: 'long' }));
        weekdays.short.push(intl.formatDate(day, { weekday: 'short' }));
      }

      derivedState.weekdays = weekdays;
    }

    if (Object.keys(derivedState).length) {
      return derivedState;
    }

    return null;
  }

  localeUtils = {
    formatWeekdayLong: weekday => {
      const { weekdays } = this.state;

      return weekdays.long[weekday];
    },
    formatWeekdayShort: weekday => {
      const { weekdays } = this.state;

      return weekdays.short[weekday];
    },
  };

  modifiers = {
    selected: weekday => {
      const { selected } = this.state;

      return selected.includes(weekday);
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: [],
    };
  }

  handleWeekdayClick = (e, value) => {
    const { input } = this.props;
    const { selected } = this.state;

    const newValue = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value].sort();

    this.setState({ selected: newValue }, () => {
      if (typeof input.onChange === 'function') {
        input.onChange(newValue);
      }
    });
  };

  render() {
    const { visible, classNamePrefix, locale } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <WeekdayPicker
        classNamePrefix={classNamePrefix}
        modifiers={this.modifiers}
        onWeekdayTouchTap={this.handleWeekdayClick}
        onWeekdayClick={this.handleWeekdayClick}
        locale={locale}
        localeUtils={this.localeUtils}
      />
    );
  }
}
