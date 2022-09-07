import getConfig from 'next/config';
import React from 'react';

const {
  serverRuntimeConfig: {
    core
  }
} = getConfig();

export async function getServerSideProps() {
  const {
    agendas
  } = await core.agendas.search();

  return {
    props: {
      agendas
    }
  };
}

function Demo({ agendas }) {
  return (
    <div>
      <h1>Une page NextJs</h1>
      <h2>Quelques agendas</h2>
      <ul>
        {agendas.map(a => (
          <li key={a.uid}>
            <a href={`https://openagenda.com/${a.slug}`}>{a.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Demo;
