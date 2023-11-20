import { createMemoryHistory } from 'history';
import createApp from '../src/client/apps/agenda';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { apiRoot } = {} ) => ({
  settings: {
    apiRoot,
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    list: '/agenda/list'
  },
  agenda: {
    uid: 48959239,
    slug: 'la-gargouille',
    title: 'La gargouille',
    isAggregator: true
  }
});

export default {
  title: 'Agenda',
  decorators: [
    PageDecorator,
  ],
};

export function App() {
  const { element } = createApp( {
    history: createMemoryHistory(),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } );

  return element;;
}
