import { Children } from 'react';
import { EventState } from '@openagenda/react-shared';

const flatten = (value, lang) => (
  typeof value === 'string' ? value : (value ?? {})[lang] ?? (value ?? {})[Object.keys(value || {}).shift()]
);

export default function EventItem({ event, lang, children, id }) {
  return (
    <>
      <strong className="margin-right-xs">{flatten(event.title, lang)}</strong>
      {event.state !== 2 ? <EventState value={event.state} displayLabel={false} id={`${id}-${event.slug}`} /> : null}
      <div>{flatten(event.dateRange, lang)}</div>
      {Children.count(children) > 0 ? (
        <div>{Children.map(children, child => child)}</div>
      ) : null}
    </>
  );
}
