import '@openagenda/bs-templates/compiled/main.css';
import { MemoryRouter } from 'react-router';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { useLayoutData } from '@openagenda/react-shared';
import { Provider as ReduxProvider } from 'react-redux';

import AgendaDataLayoutComponent from '../src/layouts/AgendaDataLayout.js';
import AgendaLayoutComponent from '../src/layouts/AgendaLayout.js';

import createLayoutStore from '../src/createLayoutStore.js';
import agenda from './fixtures/agenda.json';
import ProvidersDecorator from './decorators/Providers.js';

export default {
  title: 'All',
  decorators: [ProvidersDecorator],
  layout: 'fullscreen',
};

const defaultLayoutStore = {
  main: {
    apiRoot: '',
  },
  res: {},
};

const Component = () => {
  const { agenda: agendaFromLayout } = useLayoutData();

  return (
    <p>
      Layout data is accessible in child component: {agendaFromLayout.title}
    </p>
  );
};

export function AgendaLayout(_balek, { axios }) {
  const mock = new MockAdapter(axios);

  mock.onGet('/api/agendas/slug/:slug').reply((_req) => [
    200,
    {
      ...agenda,
      description: 'The AgendaDataLayout provides the agenda to child layouts',
    },
  ]);

  const store = createLayoutStore(defaultLayoutStore, { location: null });

  return (
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/an-agenda/contribute']}>
        <AgendaDataLayoutComponent childLayouts={[AgendaLayoutComponent]}>
          <Component />
        </AgendaDataLayoutComponent>
      </MemoryRouter>
    </ReduxProvider>
  );
}

function ChildLayout(props) {
  const { children, extraProps } = props;

  return (
    <div style={{ background: 'lightblue', padding: '1em' }}>
      <strong>
        Child layout content for agenda {extraProps.agenda.title} (agenda loaded
        by AgendaDataLayout)
      </strong>
      <div>{children}</div>
    </div>
  );
}

export function AgendaDataLayout(_balek, { axios }) {
  const mock = new MockAdapter(axios);

  mock.onGet('/api/agendas/slug/:slug').reply((_req) => [200, agenda]);

  const store = createLayoutStore(defaultLayoutStore, { location: null });

  return (
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/an-agenda/contribute']}>
        <strong>
          The AgendaDataLayout provides the agenda to child layouts
        </strong>
        <AgendaDataLayoutComponent childLayouts={[ChildLayout]}>
          <div style={{ padding: '1em', background: 'white' }}>
            Child component content
          </div>
        </AgendaDataLayoutComponent>
      </MemoryRouter>
    </ReduxProvider>
  );
}
