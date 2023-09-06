import React, { Component } from 'react';
import { injectIntl /* , defineMessages */ } from 'react-intl';
import Select from 'react-select';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as dateFns from 'date-fns';

// const messages = defineMessages({
//   weekIndicator: {
//     id: 'rtp.header.weekIndicator',
//     defaultMessage: 'Week {weekNumber, number}'
//   }
// });

function getYearOptions(activeYear) {
  return Array(5)
    .fill(activeYear - 2)
    .map((value, i) => {
      const year = value + i;

      return {
        value: year,
        label: year,
      };
    });
}

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeWeek: null,
      selectedMonth: null,
      selectedYear: null,
      monthOptions: [],
      yearOptions: [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { activeWeek, intl } = props;

    if (
      state.activeWeek
      && state.activeWeek.getTime() === activeWeek.getTime()
    ) {
      return null;
    }

    const month = dateFns.getMonth(activeWeek);
    const year = dateFns.getYear(activeWeek);
    const formatMonth = val => intl.formatDate(new Date(year, val), { month: 'long' });

    const monthOptions = Array(12)
      .fill()
      .map((e, i) => ({ value: i, label: formatMonth(i) }));
    const selectedMonth = { value: month, label: formatMonth(month) };
    const selectedYear = { value: year, label: year };

    return {
      activeWeek: props.activeWeek,
      monthOptions,
      yearOptions: getYearOptions(year),
      selectedMonth,
      selectedYear,
    };
  }

  onMonthChange = option => {
    const { onMonthChange } = this.props;

    return onMonthChange(option.value);
  };

  onYearChange = option => {
    const { onYearChange } = this.props;

    return onYearChange(option.value);
  };

  render() {
    const { classNamePrefix, onPrevWeek, onNextWeek } = this.props;
    const {
      monthOptions,
      yearOptions,
      selectedMonth,
      selectedYear,
    } = this.state;

    return (
      <div className={`${classNamePrefix}header`}>
        <div
          role="button"
          tabIndex={0}
          className={`${classNamePrefix}prev-week`}
          onClick={onPrevWeek}
          onKeyPress={onPrevWeek}
        >
          <FaChevronLeft className={`${classNamePrefix}icon`} />
        </div>

        {/* <span className={`${classNamePrefix}week-indicator`}>
          {intl.formatMessage( messages.weekIndicator, { weekNumber: dateFns.getISOWeek( activeWeek ) } )}
        </span> */}

        <div
          role="button"
          tabIndex={0}
          className={`${classNamePrefix}next-week`}
          onClick={onNextWeek}
          onKeyPress={onNextWeek}
        >
          <FaChevronRight className={`${classNamePrefix}icon`} />
        </div>

        <div className={`${classNamePrefix}selectors`}>
          <span className={`${classNamePrefix}month-selector`}>
            <Select
              value={selectedMonth}
              onChange={this.onMonthChange}
              options={monthOptions}
              className={`${classNamePrefix}month-selector__Select`}
              classNamePrefix={`${classNamePrefix}month-selector__Select`}
            />
          </span>
          <span className={`${classNamePrefix}year-selector`}>
            <Select
              value={selectedYear}
              onChange={this.onYearChange}
              options={yearOptions}
              className={`${classNamePrefix}year-selector__Select`}
              classNamePrefix={`${classNamePrefix}year-selector__Select`}
            />
          </span>
        </div>
      </div>
    );
  }
}

export default injectIntl(Header, { forwardRef: true });
