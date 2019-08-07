import React from 'react';
import { storiesOf } from '@storybook/react';
import createApp from '../components/src/main';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;


storiesOf( 'App', module )
  .add( 'all', () => (
      <>
        <div>
          <form className="js_agenda_search"><input type="text" /></form>
        </div>
        <div className="js_search_canvas">
          {createApp( {
            skipRender: true,
            res: `${apiRoot}/json`,
            lang: 'fr'
          } )}
        </div>
      </>
    )
  );
