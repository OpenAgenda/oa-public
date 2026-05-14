import qs from 'qs';
import { useEffect, useState, useCallback } from 'react';
import { Spinner } from '@openagenda/react-shared';
import { useIntl } from 'react-intl';
import EventItem from './EventItem.js';
import messages from './messages.js';
import includeFields from './includeFields.json' with { type: 'json' };

export default function Selection({ res, value, lang, onChange }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const m = useIntl().formatMessage;

  useEffect(() => {
    const identifiers = [].concat(value).filter((v) => !!v);

    if (!identifiers.length) {
      return;
    }
    setIsLoading(true);

    fetch(
      `${res}?${qs.stringify({
        uid: identifiers,
        state: [0, 1, 2],
        includeFields,
      })}`,
    ).then((r) => {
      setIsLoading(false);
      if (!r.ok) {
        setErrored(true);
        return;
      }
      r.json().then((data) => {
        setEvents(data.events);
      });
    });
  }, [res, value]);

  const onRemove = useCallback(
    (uidToRemove) => {
      const filteredSelection = events.filter((e) => e.uid !== uidToRemove);
      setEvents(filteredSelection);
      onChange(filteredSelection.map((e) => e.uid));
    },
    [events, onChange],
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (errored) {
    return <p>{m(messages.loadError)}</p>;
  }

  if (!events.length) {
    return (
      <div className="padding-all-md text-center">
        {m(messages.emptySelection)}
      </div>
    );
  }

  return (
    <ul className="list-unstyled">
      {events.map((event) => (
        <li className="margin-v-sm" key={`selected-event-${event.uid}`}>
          <EventItem event={event} lang={lang}>
            <a
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-link padding-all-z margin-right-sm"
            >
              {m(messages.show)}
            </a>
            <button
              type="button"
              className="btn btn-link padding-all-z text-danger"
              onClick={() => onRemove(event.uid)}
            >
              {m(messages.remove)}
            </button>
          </EventItem>
        </li>
      ))}
    </ul>
  );
}
