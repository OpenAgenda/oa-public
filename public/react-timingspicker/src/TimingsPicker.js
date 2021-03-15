import React, { Component } from 'react';
import * as dateFns from 'date-fns';
import ReactResizeDetector from 'react-resize-detector';
import classNames from 'classnames';
import { IntlProvider } from 'react-intl';
import Stats from './Stats';
import Header from './Header';
import Scheduler from './Scheduler';
import locales from './locales-compiled';

const ONE_DAY = 60 * 60 * 24;

const weekStartsDay = {
  en: 0,
  fr: 1,
};

function widthToBreakpoint(breakpoints, width) {
  for (const key of Object.keys(breakpoints)) {
    const breakpoint = breakpoints[key];

    if (width < breakpoint) {
      return key;
    }
  }

  return null;
}

function getClosestTiming(value) {
  if (!value || !value.length) {
    return null;
  }

  const { first, next } = value.reduce(
    (result, val) => {
      const begin = typeof val.begin === 'string' ? dateFns.parseISO(val.begin) : val.begin;

      if (!result.first || dateFns.isBefore(begin, result.first)) {
        result.first = begin;
      }

      if (
        (!result.next && dateFns.isAfter(begin, Date.now()))
        || (dateFns.isAfter(begin, Date.now())
          && dateFns.isBefore(begin, result.next))
      ) {
        result.next = begin;
      }

      return result;
    },
    { first: null, next: null }
  );

  return next || first;
}

export default class TimingsPicker extends Component {
  static defaultProps = {
    value: null,
    onChange: null,
    editOnClick: true,
    timingLimit: ONE_DAY,
    classNamePrefix: 'rtp__',
    breakpoints: {
      xs: 590,
      sm: 640,
      md: 768,
    },
    locale: 'en',
    locales: null,
  };

  schedulerRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      activeWeek: null,
      breakpoint: null,
      weekStartsOn: 0,
      locales: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const derivedState = {};

    if (props.weekStartsOn !== state.weekStartsOn) {
      derivedState.weekStartsOn = typeof props.weekStartsOn === 'number'
        ? props.weekStartsOn
        : weekStartsDay[props.locale] || 0;
    }

    if (props.activeWeek !== state.activeWeek) {
      if (props.activeWeek) {
        derivedState.activeWeek = new Date(props.activeWeek);
      } else if (state.activeWeek) {
        derivedState.activeWeek = new Date(state.activeWeek);
      } else {
        const closestValue = getClosestTiming(props.value);

        if (closestValue) {
          derivedState.valueToHighlight = new Date(closestValue);
        }

        derivedState.activeWeek = new Date(
          closestValue || getClosestTiming(props.allowedTimings) || Date.now()
        );
      }
    }

    if (props.locale !== state.locale || props.locales !== state.locales) {
      derivedState.locale = props.locale;
      derivedState.locales = props.locales;
      derivedState.messages = {
        ...locales[props.locale],
        ...(props.locales && props.locales[props.locale]),
      };
    }

    if (props.value !== state.value) {
      derivedState.value = (props.value || state.value || []).map(v => ({
        begin:
          typeof v.begin === 'string' ? dateFns.parseISO(v.begin) : v.begin,
        end: typeof v.end === 'string' ? dateFns.parseISO(v.end) : v.end,
      }));
    }

    if (Object.keys(derivedState).length) {
      return derivedState;
    }

    return null;
  }

  updateActiveWeek = fn => {
    const { onChangeActiveWeek } = this.props;
    const { activeWeek } = this.state;

    const newActiveWeek = fn(activeWeek);

    this.setState({
      activeWeek: newActiveWeek,
    });

    if (typeof onChangeActiveWeek === 'function') {
      onChangeActiveWeek(newActiveWeek);
    }
  };

  onPrevWeek = e => {
    if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    return this.updateActiveWeek(date => dateFns.subDays(date, 7));
  };

  onNextWeek = e => {
    if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    return this.updateActiveWeek(date => dateFns.addDays(date, 7));
  };

  onMonthChange = month => this.updateActiveWeek(date => dateFns.setMonth(date, month));

  onYearChange = month => this.updateActiveWeek(date => dateFns.setYear(date, month));

  onChange = value => {
    const { onChange } = this.props;

    if (typeof onChange === 'function') {
      onChange(value);
    } else {
      this.setState({ value });
    }
  };

  reset = e => {
    if (e.type === 'keypress' && ![' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    const schedulerEl = this.schedulerRef.current;

    if (schedulerEl.state.showRecurrencerModal) {
      schedulerEl.handleCloseRecurrencerModal();
    }

    if (schedulerEl.state.showEditModal) {
      schedulerEl.handleCloseEditModal();
    }

    this.onChange([]);
  };

  onResize = width => {
    const { breakpoints } = this.props;
    const breakpoint = widthToBreakpoint(breakpoints, width);

    this.setState({ breakpoint });
  };

  render() {
    const {
      timingLimit,
      allowedTimings,
      classNamePrefix,
      editOnClick,
      locale,
    } = this.props;
    const {
      value,
      messages,
      activeWeek,
      weekStartsOn,
      breakpoint,
      valueToHighlight,
    } = this.state;

    return (
      <IntlProvider locale={locale} key={locale} messages={messages}>
        <div
          className={classNames(`${classNamePrefix}calendar`, {
            [classNamePrefix + breakpoint]: breakpoint,
          })}
        >
          <ReactResizeDetector
            handleWidth
            handleHeight
            onResize={this.onResize}
          />

          <Stats
            value={value}
            reset={this.reset}
            classNamePrefix={classNamePrefix}
          />
          <Header
            activeWeek={activeWeek}
            onPrevWeek={this.onPrevWeek}
            onNextWeek={this.onNextWeek}
            onMonthChange={this.onMonthChange}
            onYearChange={this.onYearChange}
            classNamePrefix={classNamePrefix}
          />

          <div className={`${classNamePrefix}clearfix`} />

          <Scheduler
            ref={this.schedulerRef}
            activeWeek={activeWeek}
            weekStartsOn={weekStartsOn}
            value={value}
            onChange={this.onChange}
            timingLimit={timingLimit}
            allowedTimings={allowedTimings}
            breakpoint={breakpoint}
            classNamePrefix={classNamePrefix}
            valueToHighlight={valueToHighlight}
            editOnClick={editOnClick}
          />
        </div>
      </IntlProvider>
    );
  }
}
