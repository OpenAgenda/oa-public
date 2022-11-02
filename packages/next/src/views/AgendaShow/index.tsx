import Link from 'next/link';
import fetchLocale from './locales';

export type AgendaShowProps = {
  agenda: {
    title: string
  },
  events: any,
};

function AgendaShow({ agenda, events }: AgendaShowProps) {
  return (
    <div>
      <h1>Une page NextJs - {agenda.title}</h1>
      <Link href="/n/bordeaux-metropole/events/visite-des-arbres-remarquables-du-parc-de-bourran">
        Go to event
      </Link>
      <pre>
        <code>{JSON.stringify(agenda, null, 2)}</code>
      </pre>
      <pre>
        <code>{JSON.stringify(events, null, 2)}</code>
      </pre>
    </div>
  );
}

AgendaShow.fetchLocale = fetchLocale;

export default AgendaShow;
