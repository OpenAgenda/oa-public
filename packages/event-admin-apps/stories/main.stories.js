import { createMemoryHistory } from 'history';
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
    perPageLimit: 20,
  },
  res: {},
});

export default {
  title: 'OpenAgenda/Main',
};

export const Presentation = () => wrapApp(
  createApp({
    history: createMemoryHistory(),
    initialState: getDefaultState({
      apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
    }),
  }),
  {
    extraProps: {
      lang: 'fr',
      agenda: {
        uid: 48959239,
        slug: 'la-gargouille',
        title: 'La gargouille',
        credentials: {
          aggregator: true,
        },
      },
    },
  }
);
Presentation.decorators = [PageDecorator];
