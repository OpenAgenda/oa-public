import React from 'react';
import createApp from '../components/src/main';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;

export default {
  title: 'App',
};

export function All() {
  return (
    <>
      <div>
        <form className="js_agenda_search"><input type="text" /></form>
      </div>
      <div className="js_search_canvas">
        {createApp({
          skipRender: true,
          res: `${apiRoot}/json`,
          lang: 'fr',
          loadOnMount: true // use only for storybook (without SSR)
        })}
      </div>
    </>
  );
}
