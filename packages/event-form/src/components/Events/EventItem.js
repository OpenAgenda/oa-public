import { Children } from 'react';

const flatten = (value, lang) => (
  typeof value === 'string' ? value : (value ?? {})[lang] ?? (value ?? {})[Object.keys(value || {}).shift()]
);

export default function EventItem({ event, lang, children }) {
  const title = flatten(event.title, lang);
  return (
    <>
      <strong>{title}</strong>
      {Children.count(children) > 0 ? (
        <div>{Children.map(children, child => child)}</div>
      ) : null}
    </>
  );
}
