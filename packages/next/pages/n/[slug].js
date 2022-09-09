import getConfig from 'next/config';
import React from 'react';

export async function getServerSideProps(context) {
  const {
    serverRuntimeConfig: {
      core
    }
  } = getConfig();

  const {
    query
  } = context;
  
  const agenda = await core.agendas.slug(query.slug).get({ serializable: true });
  const events = await core.agendas(89904399).events.search({}, {});

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
