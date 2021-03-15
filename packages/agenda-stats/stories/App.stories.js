import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ({ lang = 'fr', apiRoot } = {}) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
  },
  res: {},
});

export default storiesOf('App', module)
  .addDecorator(PageDecorator)
  .add('all', () => wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
      }),
    }),
    {
      extraProps: {
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
        },
      },
    }
  ));
