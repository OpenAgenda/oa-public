import React from 'react';
import { storiesOf } from '@storybook/react';
import createApp from '../components/src/main';

import '@openagenda/bs-templates/compiled/main.css';


storiesOf( 'App', module )
  .add( 'all', () => createApp( {
    skipRender: true,
    searchRes: 'http://localhost:3000/',
    agendaRes: 'http://localhost:3000/get',
    setAgendaRes: 'http://localhost:3000/set',
    membersRes: 'http://localhost:3000/members'
  } ) );
