import { http, HttpResponse } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import AgendaExportModal from 'components/AgendaExportModal';
import fetchLocale from 'components/AgendaExportModal/locales';
import { Agenda } from 'types';
import intlMessagesLoader from './loaders/intlMessagesLoader';
import ProvidersDecorator from './decorators/ProvidersDecorator';
import agendaFixtures from './fixtures/mel.agenda.json';
import userFixtures from './fixtures/user.json';
import me from './fixtures/me.json';
import columns from './fixtures/columns.json';

export default {
  component: AgendaExportModal,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Basic = {
  render: function Render() {
    const { open, onOpen, onClose } = useDisclosure({ defaultOpen: true });

    return (
      <>
        <Button onClick={onOpen}>Open modal</Button>

        <AgendaExportModal
          isOpen={open}
          onClose={onClose}
          agenda={agendaFixtures as Agenda}
          query={{}}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () => HttpResponse.json(userFixtures)),
        http.get('/api/me', () => HttpResponse.json(me)),
        http.get('/agendas/89904399/settings/exports', () =>
          HttpResponse.json(columns)),
      ],
    },
  },
};

export const OpenAccordion = {
  render: function Render() {
    const { open, onOpen, onClose } = useDisclosure({ defaultOpen: true });

    return (
      <>
        <Button onClick={onOpen}>Open modal</Button>

        <AgendaExportModal
          isOpen={open}
          onClose={onClose}
          agenda={agendaFixtures as Agenda}
          query={{}}
          defaultValue="embed"
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () => HttpResponse.json(userFixtures)),
        http.get('/api/me', () => HttpResponse.json(me)),
        http.get('/agendas/89904399/settings/exports', () =>
          HttpResponse.json(columns)),
      ],
    },
  },
};
