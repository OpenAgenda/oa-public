import qs from 'qs';
import { useEffect, useState } from 'react';
import { Spinner } from '@openagenda/react-shared';
import EventItem from './EventItem';

export default function Selection({ res, value, lang }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const identifiers = [].concat(value).filter(v => !!v);

    if (!identifiers.length) {
      return;
    }
    setIsLoading(true);

    fetch(`${res}?${qs.stringify({ uid: identifiers })}`).then(r => {
      setIsLoading(false);
      if (!r.ok) {
        setErrored(true);
        return;
      }
      r.json().then(data => {
        setEvents(data.events);
      });
    });
  }, [res, value]);

  if (isLoading) {
    return <Spinner />;
  }

  if (errored) {
    return (
      <p>Load error, try again</p>
    );
  }

  if (!events.length) {
    return (
      <div className="padding-all-sm">
        Aucun événement n&apos;a été sélectionné
      </div>
    );
  }

  return (
    <ul>
      {events.map(event => (
        <li>
          <EventItem
            event={event}
            lang={lang}
            key={`selected-event-${event.uid}`}
          >
            <button
              type="button"
              className="btn btn-link padding-all-z"
              onClick={() => setEvents(events.filter(e => e.uid !== event.uid))}
            >
              remove
            </button>
          </EventItem>
        </li>
      ))}
    </ul>
  );
}
