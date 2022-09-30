import getConfig from 'next/config';
import React from 'react';

export async function getServerSideProps({ query, req }) {
  const {
    serverRuntimeConfig: { api },
  } = getConfig();

  const [{ data: agenda }, { data: events }] = await Promise.all([
    api(req, 'get', `/api/agendas/slug/${query.slug}`),
    api(req, 'get', `/api/agendas/slug/${query.slug}/events`),
  ]);

  return {
    props: {
      agenda,
      events,
    },
  };
}

export default function Agenda({ agenda, events }) {
  return (
    <div>
      <h1>Une page NextJs - {agenda.title}</h1>
      <pre>
        <code>{JSON.stringify(agenda, null, 2)}</code>
      </pre>
      <pre>
        <code>{JSON.stringify(events, null, 2)}</code>
      </pre>
    </div>
  );
}
