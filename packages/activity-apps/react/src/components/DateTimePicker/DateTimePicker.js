import React, { Component, PropTypes } from 'react';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import moment from 'moment';
import { Button } from 'react-bootstrap';

export default class DateTimePicker extends Component {

  constructor( props ) {
    super( props );
    this.handleEvent = ::this.handleEvent;
  }

  static PropTypes = {
    handleEvent: PropTypes.func,
    startValue: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.object
    ] ),
    endValue: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.object
    ] )
  };

  state = {
    startDate: (this.props.startValue || moment()).subtract( 29, 'days' ),
    endDate: this.props.endValue || moment(),
    ranges: {
      'Aujourd\'hui': [
        moment().startOf( 'day' ),
        moment()
      ],
      'Hier': [
        moment().subtract( 1, 'days' ).startOf( 'day' ),
        moment().subtract( 1, 'days' ).endOf( 'day' )
      ],
      '7 derniers jours': [
        moment().subtract( 6, 'days' ).startOf( 'day' ),
        moment()
      ],
      '30 derniers jours': [
        moment().subtract( 29, 'days' ).startOf( 'day' ),
        moment()
      ],
      'Ce mois-ci': [
        moment().startOf( 'month' ).startOf( 'day' ),
        moment().endOf( 'month' )
      ],
      'Le mois dernier': [
        moment().subtract( 1, 'month' ).startOf( 'month' ).startOf( 'day' ),
        moment().subtract( 1, 'month' ).endOf( 'month' )
      ],
    },
  };

  handleEvent( event, picker ) {
    const { handleEvent } = this.props;

    if ( handleEvent ) handleEvent( event, picker );

    this.setState( {
      startDate: picker.startDate,
      endDate: picker.endDate,
    } );
  }

  render() {
    const { startValue, endValue, ranges } = this.props;

    const start = startValue && (startValue || this.state.startDate).format( 'LLL' );
    const end = endValue && (endValue || this.state.endDate).format( 'LLL' );
    const label = start === end ? start : start + ' - ' + end;

    const buttonStyle = { width: '100%' };

    return (
      <DatetimeRangePicker
        timePicker
        timePicker24Hour
        timePickerSeconds
        locale={{
          applyLabel: 'Appliquer',
          cancelLabel: 'Annuler',
          customRangeLabel: 'Période définie'
        }}
        startDate={startValue}
        endDate={endValue}
        ranges={ranges || this.state.ranges}
        onApply={this.handleEvent}
      >
        <Button className="selected-date-range-btn" style={buttonStyle}>
          <div className="pull-left">
            <i className="fa fa-calendar" />{' '}<span>{label}</span>
          </div>
          <div className="pull-right">
            <i className="fa fa-angle-down" />
          </div>
        </Button>
      </DatetimeRangePicker>
    );
  }

}
