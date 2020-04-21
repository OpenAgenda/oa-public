import { createMemoryHistory } from 'history';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import createApp from '../src/app';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ({ lang = 'fr', apiRoot } = {}) => ({
  settings: {
    lang,
    apiRoot: apiRoot || `//${getHostname()}:${process.env.STORYBOOK_PORT}`,
    prefix: '/'
  }
});

export default { title: 'App' };

export const announcement = () => wrapApp(
  createApp({
    history: createMemoryHistory({ initialEntries: ['/announcement'] }),
    initialState: getDefaultState()
  }),
  {
    extraProps: {
      user: {}
    }
  }
);
