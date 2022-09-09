import getConfig from 'next/config';
import React from 'react';

export async function getServerSideProps(context) {
  const {
    serverRuntimeConfig: {
      api
    }
  } = getConfig();

  const {
    query,
    req
  } = context;
  
  const {
    data: agenda
  } = await api(req, 'get', `/api/agendas/slug/${query.slug}`);

  const {
    data: events
  } = await api(req, 'get', `/api/agendas/${agenda.uid}/events`);

  return {
    props: {
      agenda,
      events
    }
  };
}

export default function Agenda({ agenda, events }) {
  return (
    <div>
      <h1>Une page NextJs - {agenda.title}</h1>
      <pre><code>{JSON.stringify(agenda, null, 2)}</code></pre>
      <pre><code>{JSON.stringify(events, null, 2)}</code></pre>
    </div>
  );
}
