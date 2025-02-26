import axios from 'axios';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Modal } from '@openagenda/react-shared';
import OpenAgendaShare from './lib/OpenAgendaShare.js';
import { EmailShareMenu, EmailSentMessage } from './lib/EmailShare.js';
import CalendarShare from './lib/CalendarShare.js';

const EventShareModal = ({
  onClose,
  res = '',
  segment = 'openagenda, email, calendar',
  event,
  userLogged = false,
}) => {
  const [emailState, setEmailState] = useState({
    sent: false,
    count: 0,
    email: '',
  });

  const intl = useIntl();

  const messages = defineMessages({
    shareTitle: {
      id: 'share-title',
      defaultMessage: 'Share this event',
    },
  });

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(
      `/${event.agendaSlug}/events/${event.uid}/email`,
      { mailsend: emailState.email },
    );
    setEmailState({
      sent: true,
      count: response.data.count,
      email: '',
    });
  };

  if (emailState.sent) {
    return (
      <Modal
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={onClose}
        disableBodyScroll
      >
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
    <Modal
      classNames={{ overlay: 'popup-overlay big' }}
      onClose={onClose}
      disableBodyScroll
    >
      <div className="export-form">
        <button
          className="close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa fa-times fa-lg" />
        </button>
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
            onChange={(email) =>
              setEmailState({
                ...emailState,
                email,
              })}
            onSubmit={onEmailSubmit}
          />
        )}
        {segment.includes('calendar') && (
          <CalendarShare event={event} intl={intl} onClose={onClose} />
        )}
      </div>
    </Modal>
  );
};

export default EventShareModal;
