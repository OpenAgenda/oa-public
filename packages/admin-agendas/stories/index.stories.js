import React from 'react';
import { storiesOf } from '@storybook/react';
import createApp from '../components/src/main';

import '@openagenda/bs-templates/compiled/main.css';


storiesOf( 'App', module )
  .add( 'all', () => createApp( {
    skipRender: true,
    searchRes: '/',
    agendaRes: '/get',
    setAgendaRes: '/set',
    membersRes: '/members'
  } ) );
