import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { MemoryRouter } from 'react-router';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { Provider as ReduxProvider } from 'react-redux';

import AgendaAdminDataLayoutComponent from '../src/layouts/AgendaAdminDataLayout';
import createLayoutStore from '../src/createLayoutStore';
import ProvidersDecorator from './decorators/Providers';

import sections from './fixtures/sections.json';

export default {
  title: 'All',
  decorators: [ProvidersDecorator],
};

const defaultLayoutStore = {
  main: {
    apiRoot: '',
  },
  res: {
    agendaAdmin: {
      verifyLocationCount: '',
    },
  },
};

export function AgendaAdminDataLayout(_balek, { axios }) {
  const mock = new MockAdapter(axios);

  mock.onGet('/:slug/admin/layout').reply(_req => [
    200,
    {
      sections,
      agenda: {
        uid: 1234,
      },
    },
  ]);

  const store = createLayoutStore(defaultLayoutStore, { location: null });

  function ChildLayout(props) {
    const { children, extraProps } = props;

    return (
      <div style={{ background: 'lightblue', padding: '1em' }}>
        <strong>
          Child layout content: {extraProps.user.name} (user loaded by
          AgendaAdminDataLayout)
        </strong>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/an-agenda/contribute']}>
        <strong>
          The AgendaAdminDataLayout provides the agenda to child layouts
        </strong>
        <AgendaAdminDataLayoutComponent
          childLayouts={[ChildLayout]}
          extraProps={{
            user: { name: 'Billy Bravo' },
          }}
        >
          <div style={{ padding: '1em', background: 'white' }}>
            Child component content
          </div>
        </AgendaAdminDataLayoutComponent>
      </MemoryRouter>
    </ReduxProvider>
  );
}
