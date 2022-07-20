import axios from 'axios';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';

import { Modal } from '@openagenda/react-shared';
import OpenAgendaShare from './lib/OpenAgendaShare';
import {
  EmailShareMenu,
  EmailSentMessage
} from './lib/EmailShare';
import CalendarShare from './lib/CalendarShare';

const EventShareModal = ({
  onClose, res, segment, event, userLogged
}) => {
  const [emailState, setEmailState] = useState({ sent: false, count: 0, email: '' });

  const intl = useIntl();

  const messages = defineMessages({
    shareTitle: {
      id: 'share-title',
      defaultMessage: 'Share this event',
    }
  });

  const onEmailSubmit = async e => {
    e.preventDefault();
    const response = await axios.post(`/${event.agendaSlug}/events/${event.uid}/email`, { mailsend: emailState.email });
    setEmailState({
      sent: true,
      count: response.data.count,
      email: ''
    });
  };

  if (emailState.sent) {
    return (
      <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={onClose} disableBodyScroll>
        <EmailSentMessage
          count={emailState.count}
          intl={intl}
          title={intl.formatMessage(messages.shareTitle)}
          onClose={onClose}
        />
      </Modal>
    );
  }

  return (
    <Modal classNames={{ overlay: 'popup-overlay big' }} onClose={onClose} disableBodyScroll>
      <div className="export-form">
        <button className="export-close" type="button" onClick={onClose}>
          <i className="fa fa-times fa-lg" />
        </button>
        {segment === 'openagenda, email, calendar' && (
          <h1 className="export-title-big">{intl.formatMessage(messages.shareTitle)}</h1>
        )}
        {segment.includes('openagenda') && (
          <OpenAgendaShare
            intl={intl}
            userLogged={userLogged}
            preFetch={segment.split(',').length === 1}
            res={res}
            event={event}
          />
        )}
        {userLogged && segment.includes('email') && (
          <EmailShareMenu
            intl={intl}
            onChange={email => setEmailState({
              ...emailState,
              email
            })}
            onSubmit={onEmailSubmit}
          />
        )}
        {segment.includes('calendar') && (
          <CalendarShare
            event={event}
            intl={intl}
            onClose={onClose}
          />
        )}
      </div>
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
  res: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  segment: PropTypes.string,
  userLogged: PropTypes.bool,
};

EventShareModal.defaultProps = {
  res: '',
  segment: 'openagenda, email, calendar',
  userLogged: false,
};
