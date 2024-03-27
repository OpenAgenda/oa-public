import { Children } from 'react';

const flatten = (value, lang) => (
  typeof value === 'string' ? value : (value ?? {})[lang] ?? (value ?? {})[Object.keys(value || {}).shift()]
);

export default function EventItem({ event, lang, children }) {
  return (
    <>
      <strong>{flatten(event.title, lang)}</strong>
      <div>{flatten(event.dateRange, lang)}</div>
      {Children.count(children) > 0 ? (
        <div>{Children.map(children, child => child)}</div>
      ) : null}
    </>
  );
}
