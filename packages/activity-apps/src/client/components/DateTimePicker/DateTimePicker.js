import { Component } from 'react';
import DatetimeRangePicker from '@openagenda/react-bootstrap-datetimerangepicker';
import moment from 'moment';

export default class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.handleEvent = this.handleEvent.bind(this);
    this.state = {
      startDate: props.startValue || moment().subtract(29, 'days').toDate(),
      endDate: props.endValue || moment().toDate(),
      ranges: {
        "Aujourd'hui": [moment().startOf('day').toDate(), moment().toDate()],
        Hier: [
          moment().subtract(1, 'days').startOf('day').toDate(),
          moment().subtract(1, 'days').endOf('day').toDate(),
        ],
        '7 derniers jours': [
          moment().subtract(6, 'days').startOf('day').toDate(),
          moment().toDate(),
        ],
        '30 derniers jours': [
          moment().subtract(29, 'days').startOf('day').toDate(),
          moment().toDate(),
        ],
        'Ce mois-ci': [
          moment().startOf('month').startOf('day').toDate(),
          moment().endOf('month').toDate(),
        ],
        'Le mois dernier': [
          moment()
            .subtract(1, 'month')
            .startOf('month')
            .startOf('day')
            .toDate(),
          moment().subtract(1, 'month').endOf('month').toDate(),
        ],
      },
    };
  }

  handleEvent(event, picker) {
    const { handleEvent } = this.props;

    if (handleEvent) handleEvent(event, picker);

    this.setState({
      startDate: picker.startDate,
      endDate: picker.endDate,
    });
  }

  render() {
    const { startValue, endValue, ranges: rangesProp } = this.props;
    const { startDate, endDate, ranges } = this.state;

    const start = startValue || startDate;
    const end = endValue || endDate;
    const label = start === end
      ? moment(start).format('LLL')
      : `${moment(start).format('LLL')} - ${moment(end).format('LLL')}`;

    const buttonStyle = { width: '100%' };

    return (
      <DatetimeRangePicker
        timePicker
        timePicker24Hour
        timePickerSeconds
        locale={{
          applyLabel: 'Appliquer',
          cancelLabel: 'Annuler',
          customRangeLabel: 'Période définie',
        }}
        startDate={startValue}
        endDate={endValue}
        ranges={rangesProp || ranges}
        onApply={this.handleEvent}
      >
        <button
          type="button"
          className="btn selected-date-range-btn"
          style={buttonStyle}
        >
          <div className="pull-left">
            <i className="fa fa-calendar" /> <span>{label}</span>
          </div>
          <div className="pull-right">
            <i className="fa fa-angle-down" />
          </div>
        </button>
      </DatetimeRangePicker>
    );
  }
}
