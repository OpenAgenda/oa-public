import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useEventRes from '../hooks/useEventRes';
import utils from '../lib/utils';
import Canvas from './Canvas';

const messages = defineMessages({
  eventIsInTarget: {
    id: 'AgendaContribute.EventIsAlreadyInTarget.isInTarget',
    defaultMessage: 'The event is already referenced in the agenda you want to share it to. If you do not see it appear on the main page, it is likely that administrators haven\'t published it yet.'
  },
  goBack: {
    id: 'AgendaContribute.EventIsAlreadyInTarget.goBack',
    defaultMessage: 'Go back'
  },
});

const {
  doRedirect
} = utils;

export default function EventIsAlreadyInTarget({
  event,
  history,
  location,
  agenda,
  fromAgenda
}) {
  const fromEventRes = useEventRes(fromAgenda, event);
  const m = useIntl().formatMessage;

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      <div className="padding-all-md wsq text-center">
        <div className="text-center margin-bottom-sm">
          {m(messages.eventIsInTarget)}
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-default margin-h-sm"
            onClick={() => doRedirect(history, location, fromEventRes)}
          >
            {m(messages.goBack)}
          </button>
        </div>
      </div>
    </Canvas>
  );
}
