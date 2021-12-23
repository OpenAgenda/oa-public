import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';
import moment from 'moment-timezone';
import { Modal } from '@openagenda/react-shared';
import AgendaSearchInput from './AgendaSearchInput';
import Radio from './Radio';
import encodeURL from './lib/encodeURL';

const EventShareModal = ({
  onClose, res, segment, event, userLogged
}) => {
  const [emailValue, setEmailValue] = useState('');
  const [calendarValue, setCalendarValue] = useState('');
  const [emailQuantity, setEmailQuantity] = useState(0);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [options, setOptions] = useState(false);
  const [datesOptions, setDatesOptions] = useState(false);
  const [noFutureEvents, setNoFutureEvents] = useState(false);
  const [dates, setDates] = useState({});
  const [link, setLink] = useState('');

  const calendars = [
    { name: 'Google Calendar', service: 'google' },
    { name: 'Yahoo! Calendar', service: 'yahoo' },
    { name: 'Windows Live', service: 'live' },
    { name: 'ICS', service: 'ics' },
  ];

  const intl = useIntl();

  const messages = defineMessages({
    shareTitle: {
      id: 'share-title',
      defaultMessage: 'Share this event',
    },
    shareOA: {
      id: 'share-oa',
      defaultMessage: 'Share on OpenAgenda',
    },
    shareEmail: {
      id: 'share-email',
      defaultMessage: 'Send by email',
    },
    emailPlaceholder: {
      id: 'email-placeholder',
      defaultMessage: 'Type in the email you want to send the event to',
    },
    shareCalendar: {
      id: 'share-calendar',
      defaultMessage: 'Import in a personal calendar',
    },
    emailSuccess: {
      id: 'email-success',
      defaultMessage:
        'The event was sent to {count, plural, =0 {no email address} one {# email address} other {# email addresses}}.',
    },
    calendarDate: {
      id: 'calendar-date',
      defaultMessage: 'This event has no upcoming dates',
    },
    import: {
      id: 'import',
      defaultMessage: 'Import',
    },
    send: {
      id: 'send',
      defaultMessage: 'Send',
    },
    signIn: {
      id: 'sign-in',
      defaultMessage: 'You need to sign in to your account to add this event to your OpenAgendas',
    },
    connectionBtn: {
      id: 'connection-btn',
      defaultMessage: 'Sign In',
    },
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await axios.post(`/${event.agendaSlug}/events/${event.uid}/email`, { mailsend: emailValue });
    setEmailValue('');
    setEmailQuantity(response.data.count);
    setEmailSuccess(true);
  };

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
      `/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=${service}`
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

  const getTitleLink = agenda => `/${agenda.slug}/contribute/event/${event.uid}/from/${event.agendaUid}?redirect=${encodeURL(`${event.root}/agendas/${event.agendaUid}/events/${event.uid}`)}`;

  return (
    <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={onClose} disableBodyScroll>
      {emailSuccess ? (
        <div className="export-form">
          <button className="export-close" type="button" onClick={onClose}>
            <i className="fa fa-times fa-lg" />
          </button>
          <h1 className="export-title-big">{intl.formatMessage(messages.shareTitle)}</h1>
          <p className="confirmation-message">{intl.formatMessage(messages.emailSuccess, { count: emailQuantity })}</p>
          <button className="btn btn-primary export-button" type="button" onClick={onClose}>
            OK
          </button>
        </div>
      ) : (
        <div className="export-form">
          <button className="export-close" type="button" onClick={onClose}>
            <i className="fa fa-times fa-lg" />
          </button>
          {segment === 'openagenda, email, calendar' && (
            <h1 className="export-title-big">{intl.formatMessage(messages.shareTitle)}</h1>
          )}
          {segment.includes('openagenda') && (
            <div className="margin-bottom-md">
              <h2 className="export-title-md">{intl.formatMessage(messages.shareOA)}</h2>
              {userLogged ? (
                <AgendaSearchInput
                  getTitleLink={getTitleLink}
                  preFetchAgendas={segment === 'openagenda'}
                  res={res}
                  targetAgenda={{ title: event.agendaTitle, slug: event.agendaSlug }}
                />
              ) : (
                <>
                  <p>{intl.formatMessage(messages.signIn)}</p>
                  <a
                    className="btn btn-primary export-button"
                    href={`${event.root}/${event.agendaSlug}/signin?redirect=${encodeURL(`${event.root}/agendas/${event.agendaUid}/events/${event.uid}?displayShareModal=1`)}`}
                  >
                    {intl.formatMessage(messages.connectionBtn)}
                  </a>
                </>
              )}
            </div>
          )}
          {userLogged && segment.includes('email') && (
            <form onSubmit={handleSubmit}>
              <h2 className="export-title-md">{intl.formatMessage(messages.shareEmail)}</h2>
              <div className="form-group">
                <div className="input-group input-textarea">
                  <textarea
                    className="form-control export-textarea"
                    cols="60"
                    rows="4"
                    id="textarea"
                    placeholder={intl.formatMessage(messages.emailPlaceholder)}
                    value={emailValue}
                    onChange={e => setEmailValue(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {intl.formatMessage(messages.send)}
              </button>
            </form>
          )}
          {segment.includes('calendar') && (
            <div className="margin-bottom-md">
              <h2 className="export-title export-title-md">{intl.formatMessage(messages.shareCalendar)}</h2>
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
          )}
        </div>
      )}
    </Modal>
  );
};

export default EventShareModal;

EventShareModal.propTypes = {
  event: PropTypes.shape({
    agendaUid: PropTypes.number,
    uid: PropTypes.number,
    agendaTitle: PropTypes.string,
    agendaSlug: PropTypes.string,
    lang: PropTypes.string,
    root: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  res: PropTypes.string,
  segment: PropTypes.string,
  userLogged: PropTypes.bool,
};

EventShareModal.defaultProps = {
  res: '',
  segment: 'openagenda, email, calendar',
  userLogged: false,
};
