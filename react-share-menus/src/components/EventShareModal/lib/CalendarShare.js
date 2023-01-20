import axios from 'axios';
import moment from 'moment-timezone';
import { Fragment, useState } from 'react';
import { defineMessages } from 'react-intl';

import Radio from '../../Radio';

const calendars = [
  { name: 'Google Calendar', service: 'google' },
  { name: 'Yahoo! Calendar', service: 'yahoo' },
  { name: 'Windows Live', service: 'live' },
  { name: 'ICS', service: 'ics' },
];

const messages = defineMessages({
  shareCalendar: {
    id: 'share-calendar',
    defaultMessage: 'Import in a personal calendar',
  },
  calendarDate: {
    id: 'calendar-date',
    defaultMessage: 'This event has no upcoming dates',
  },
  import: {
    id: 'import',
    defaultMessage: 'Import',
  },
});

export default function CalendarShare(props) {
  const {
    intl,
    onClose,
    event,
  } = props;

  const [link, setLink] = useState('');
  const [calendarValue, setCalendarValue] = useState('');
  const [options, setOptions] = useState(false);
  const [datesOptions, setDatesOptions] = useState(false);
  const [noFutureEvents, setNoFutureEvents] = useState(false);
  const [dates, setDates] = useState({});

  const selectDate = date => {
    if (Object.keys(dates).length === 0 || dates?.days.length === 1) {
      return setLink(date[0].link);
    }
    const calendarLink = dates.days.find(d => d.begin === date.begin).link;
    return setLink(calendarLink);
  };

  const selectCalendar = async (name, service) => {
    setCalendarValue(name);

    const response = await axios.get(
      `/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=${service}`,
    );

    const today = moment().tz(response.data.event.timezone).format('YYYY-MM-DD');

    const upcomingDates = response.data.event.timings.filter(date => date.begin > today);

    setDates({ timezone: response.data.event.timezone, days: upcomingDates });

    if (upcomingDates.length === 0) setNoFutureEvents(true);

    if (upcomingDates.length === 1) {
      selectDate(response.data.event.timings, response.data.event.timings[0].begin);
      return setOptions(true);
    }

    setDatesOptions(true);
    return setOptions(true);
  };

  return (
    <div className="margin-top-sm margin-bottom-md">
      <h2 className="export-title">{intl.formatMessage(messages.shareCalendar)}</h2>
      <form>
        {calendars.map(calendar => (
          <Fragment key={calendar.service}>
            <Radio
              content={calendar.name}
              name="calendars"
              id={calendar.service}
              setChoice={(name, service) => selectCalendar(name, service)}
            />
            {options && calendar.name === calendarValue && (
              <div className="calendars-options">
                {datesOptions && (
                  <ul className="calendars-list">
                    {dates.days.map(date => {
                      const begin = moment
                        .tz(date.begin, dates.timezone)
                        .locale(event.lang)
                        .format('dddd D MMMM YYYY, HH:mm - ');
                      const end = moment.tz(date.end, dates.timezone).locale(event.lang).format('HH:mm');
                      return (
                        <Radio
                          content={begin + end}
                          name="dates"
                          key={date.begin}
                          id={date.begin}
                          setChoice={() => selectDate(date)}
                        />
                      );
                    })}
                  </ul>
                )}
                {noFutureEvents ? (
                  <p>{intl.formatMessage(messages.calendarDate)}</p>
                ) : (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={link}
                    className="btn btn-primary btn-calendar"
                    onClick={onClose}
                  >
                    {intl.formatMessage(messages.import)}
                  </a>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </form>
    </div>
  );
}
