import getConfig from 'next/config';
import React from 'react';

const flatten = (value = {}, preferredLang = 'fr') => value[preferredLang] ?? value[Object.keys(value).shift()];

export async function getServerSideProps({ query, req }) {
  const {
    serverRuntimeConfig: { api },
  } = getConfig();

  const [{ data: agenda }, { data: { event } }] = await Promise.all([
    api(req, 'get', `/api/agendas/slug/${query.slug}`),
    api(req, 'get', `/api/agendas/slug/${query.slug}/events/slug/${query.eventSlug}`),
  ]);

  return {
    props: {
      agenda,
      event,
    },
  };
}

export default function Event({ agenda, event }) {
  return (
    <div>
      <h1>Une autre page NextJs</h1>
      <h2>L&apos;événement: {flatten(event.title)}</h2>
      <h3>L&apos;agenda: {agenda.title}</h3>
    </div>
  );
}
