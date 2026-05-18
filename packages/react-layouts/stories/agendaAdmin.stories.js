import '@openagenda/bs-templates/compiled/main.css';
import { MemoryRouter } from 'react-router';
import { http, HttpResponse } from 'msw';
import { Provider as ReduxProvider } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import { produce } from 'immer';

import AgendaAdminDataLayoutComponent from '../src/layouts/AgendaAdminDataLayout.js';
import AgendaAdminLayoutComponent from '../src/layouts/AgendaAdminLayout.js';

import createLayoutStore from '../src/createLayoutStore.js';
import ProvidersDecorator from './decorators/Providers.js';

import sections from './fixtures/sections.json' with { type: 'json' };

const getSections = (agendaSlug) =>
  produce(sections, (draft) => {
    draft.forEach((section) => {
      section.tabs.forEach((tab) => {
        tab.link = tab.link.replace('{agendaSlug}', agendaSlug);
      });
    });
  });

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

const Component = () => {
  const { user, agenda } = useLayoutData();

  return (
    <div>
      <p>
        Layout data is accessible in child component: {user.name} is hosting{' '}
        {agenda.title}
      </p>
    </div>
  );
};

export const AgendaAdminLayout = {
  render: () => {
    const store = createLayoutStore(defaultLayoutStore, { location: null });

    return (
      <ReduxProvider store={store}>
        <MemoryRouter initialEntries={['/an-agenda/admin/locations']}>
          <strong>
            The AgendaAdminDataLayout provides the agenda to child layouts
          </strong>
          <AgendaAdminDataLayoutComponent
            childLayouts={[AgendaAdminLayoutComponent]}
            extraProps={{
              user: { name: 'Kev le Dev de Chanteclair' },
            }}
          >
            <div style={{ padding: '1em', background: 'white' }}>
              <Component />
            </div>
          </AgendaAdminDataLayoutComponent>
        </MemoryRouter>
      </ReduxProvider>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/:slug/admin/layout', ({ params }) =>
          HttpResponse.json({
            sections: getSections(params.slug),
            agenda: {
              uid: 1234,
              title: 'La semaine du bug',
            },
          })),
      ],
    },
  },
};

function ChildLayout(props) {
  const { children, extraProps } = props;

  return (
    <div style={{ background: 'lightblue', padding: '1em' }}>
      <strong>
        Child layout content: {extraProps.user.name} on{' '}
        {extraProps.agenda.title} (user loaded by AgendaAdminDataLayout)
      </strong>
      <div>{children}</div>
    </div>
  );
}

export const AgendaAdminDataLayout = {
  render: () => {
    const store = createLayoutStore(defaultLayoutStore, { location: null });

    return (
      <ReduxProvider store={store}>
        <MemoryRouter initialEntries={['/an-agenda/admin/locations']}>
          <strong>
            The AgendaAdminDataLayout provides the agenda to child layouts
          </strong>
          <AgendaAdminDataLayoutComponent
            childLayouts={[ChildLayout]}
            extraProps={{
              user: { name: 'Billy Bravo' },
              agenda: {
                title: 'La semaine de la langue Française',
              },
            }}
          >
            <div style={{ padding: '1em', background: 'white' }}>
              Child component content
            </div>
          </AgendaAdminDataLayoutComponent>
        </MemoryRouter>
      </ReduxProvider>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/:slug/admin/layout', ({ params }) =>
          HttpResponse.json({
            sections: getSections(params.slug),
            agenda: {
              uid: 1234,
              title: 'Semaine de la langue française',
            },
          })),
      ],
    },
  },
};
