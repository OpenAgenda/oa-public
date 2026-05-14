import debug from 'debug';
import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import PassCultureConfirmation from '@openagenda/registration-apps/passCulture/Confirmation';

import Canvas from '../components/Canvas.js';
import usePrefix from '../hooks/usePrefix.js';
import utils from '../lib/utils.js';

const messages = defineMessages({
  eventUpdateSuccessInfo: {
    id: 'AgendaContribute.EditConfirmation.eventUpdateSuccessInfo',
    defaultMessage: 'The event was updated',
  },
  end: {
    id: 'AgendaContribute.EditConfirmation.end',
    defaultMessage: 'Close',
  },
});

const { doRedirect } = utils;

export default function EditConfirmation({ history, agenda }) {
  const updatedEvent = useSelector((state) => state.contribute.updatedEvent);
  const prefix = usePrefix(agenda);
  const res = useSelector((state) => state.res);
  const location = useLocation();

  const {
    eventUid, // as a string
  } = useParams();

  const log = debug('Confirmation');

  const { formatMessage: m } = useIntl();

  useEffect(() => {
    if (updatedEvent) {
      return;
    }
    log(
      '  Attempting to reach confirmation screen without a created event. Redirecting to edit',
    );

    history.replace({
      ...location,
      pathname: `${prefix}/event/${eventUid}`,
    });
  }, [history, location, prefix, updatedEvent, eventUid, log]);

  return (
    <Canvas mode="edit" event={updatedEvent}>
      <div className="padding-all-md wsq">
        <p className="text-center margin-bottom-xs margin-top-sm">
          {m(messages.eventUpdateSuccessInfo)}
        </p>
      </div>
      <PassCultureConfirmation
        className="event-instruction padding-all-md padding-v-sm"
        event={updatedEvent}
        res={res.passCulture}
      />
      <div className="padding-all-md wsq">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() =>
            doRedirect(
              history,
              location,
              res.showEvent
                .replace(':agendaUid', agenda.uid)
                .replace(':eventUid', updatedEvent.uid),
            )}
        >
          {m(messages.end)}
        </button>
      </div>
    </Canvas>
  );
}
