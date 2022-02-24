import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {
    prefix: '',
  },
  res: {
    jsonExport: '/events',
  },
  stats: {},
});

export default storiesOf('App', module)
  .addDecorator(PageDecorator)
  .add('all', () => wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
        },
        agendaSchema: {
          fields: [],
        },
      },
    }
  ));
