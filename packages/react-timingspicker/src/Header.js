import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import Select from 'react-select';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import dateFns from 'date-fns';


function getYearOptions( activeYear ) {
  return Array( 5 )
    .fill( activeYear - 2 )
    .map( ( value, i ) => {
      const year = value + i;

      return {
        value: year,
        label: year
      };
    } );
}

class Header extends Component {
  static defaultProps = {
    selectStyles: {
      option: provided => ({
        ...provided,
        textAlign: 'left',
        color: '#666666'
      }),
      singleValue: provided => ({
        ...provided,
        color: '#666666'
      })
    }
  };

  state = {
    activeWeek: null,
    selectedMonth: null,
    selectedYear: null,
    monthOptions: [],
    yearOptions: []
  };

  static getDerivedStateFromProps( props, state ) {
    const { activeWeek, intl } = props;

    if ( state.activeWeek && state.activeWeek.getTime() === activeWeek.getTime() ) {
      return null;
    }

    const month = dateFns.getMonth( activeWeek );
    const year = dateFns.getYear( activeWeek );
    const formatMonth = val => intl.formatDate( new Date( year, val ), { month: 'long' } );

    const monthOptions = Array( 12 ).fill().map( ( e, i ) => ({ value: i, label: formatMonth( i ) }) );
    const selectedMonth = { value: month, label: formatMonth( month ) }
    const selectedYear = { value: year, label: year };

    return {
      activeWeek: props.activeWeek,
      monthOptions,
      yearOptions: getYearOptions( year ),
      selectedMonth,
      selectedYear
    };
  }

  onMonthChange = option => this.props.onMonthChange( option.value );

  onYearChange = option => this.props.onYearChange( option.value );

  render() {
    const {
      onPrevWeek,
      onNextWeek,
      selectStyles,
      classNamePrefix
    } = this.props;
    const {
      monthOptions,
      yearOptions,
      selectedMonth,
      selectedYear
    } = this.state;

    return (
      <div className={`${classNamePrefix}header`}>
        <span role="button" className={`${classNamePrefix}prev-week`} onClick={onPrevWeek}>
          <FaChevronLeft className={`${classNamePrefix}icon`} />
        </span>
        <span role="button" className={`${classNamePrefix}next-week`} onClick={onNextWeek}>
          <FaChevronRight className={`${classNamePrefix}icon`} />
        </span>

        <div className={`${classNamePrefix}selectors`}>
          <span className={`${classNamePrefix}month-selector`}>
            <Select
              value={selectedMonth}
              onChange={this.onMonthChange}
              options={monthOptions}
              styles={selectStyles}
            />
          </span>
          <span className={`${classNamePrefix}year-selector`}>
            <Select
              value={selectedYear}
              onChange={this.onYearChange}
              options={yearOptions}
              styles={selectStyles}
            />
          </span>
        </div>
      </div>
    );
  }
}

export default injectIntl( Header, { withRef: true } );
