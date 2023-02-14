import { defineMessages, useIntl } from 'react-intl';

import utils from '../lib/utils';
import useEventRes from '../hooks/useEventRes';
import Canvas from './Canvas';

const messages = defineMessages({
  publishedEvent: {
    id: 'AgendaContribute.EventWasSuccessfullyShared.publishedEvent',
    defaultMessage: 'The event is now published on "{agenda}"',
  },
  addedEvent: {
    id: 'AgendaContribute.EventWasSuccessfullyShared.sharedEvent',
    defaultMessage: 'The event has been added to "{agenda}". It will be reviewed before being published',
  },
  goBack: {
    id: 'AgendaContribute.EventWasSuccessfullyShared.goBack',
    defaultMessage: 'Go back',
  },
  goTo: {
    id: 'AgendaContribute.EventWasSuccessfullyShared.goTo',
    defaultMessage: 'See the event',
  },
});

const {
  doRedirect,
} = utils;

export default function EventWasSuccessfullyShared({
  event,
  fromAgenda,
  agenda,
  history,
  location,
}) {
  const fromEventRes = useEventRes(fromAgenda, event);
  const toEventRes = useEventRes(agenda, event);
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
          {m(event.state === 2 ? messages.publishedEvent : messages.addedEvent, {
            agenda: agenda.title,
          })}
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-default margin-h-sm"
            onClick={() => doRedirect(history, location, fromEventRes, { ignoreURLRedirect: true })}
          >
            {m(messages.goBack)}
          </button>
          <button
            type="button"
            className="btn btn-primary margin-h-sm"
            onClick={() => doRedirect(history, location, toEventRes, { ignoreURLRedirect: true })}
          >
            {m(messages.goTo, { agenda: agenda.title })}
          </button>
        </div>
      </div>
    </Canvas>
  );
}
