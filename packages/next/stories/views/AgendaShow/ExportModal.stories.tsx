import { http, HttpResponse } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import AgendaShow from 'views/AgendaShow';
import ExportModal from 'views/AgendaShow/components/ExportModal';
import { Agenda } from 'types';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import me from './fixtures/me.json';
import userFixtures from './fixtures/user.json';
import columns from './fixtures/columns.json';

export default {
  title: 'views/AgendaShow/ExportModal',
  component: ExportModal,
  loaders: [intlMessagesLoader(AgendaShow.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Basic = {
  render: function Render() {
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    return (
      <>
        <Button variant="primary" onClick={onOpen}>
          Open modal
        </Button>

        <ExportModal
          isOpen={isOpen}
          onClose={onClose}
          agenda={agendaFixtures as Agenda}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () => HttpResponse.json(userFixtures)),
        http.get('/api/me', () => HttpResponse.json(me)),
        http.get('/agendas/1234/settings/exports', () =>
          HttpResponse.json(columns)),
      ],
    },
  },
};

export const OpenAccordion = {
  render: function Render() {
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    return (
      <>
        <Button variant="primary" onClick={onOpen}>
          Open modal
        </Button>

        <ExportModal
          isOpen={isOpen}
          onClose={onClose}
          agenda={agendaFixtures as Agenda}
          defaultIndex={7}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () => HttpResponse.json(userFixtures)),
        http.get('/api/me', () => HttpResponse.json(me)),
        http.get('/agendas/1234/settings/exports', () =>
          HttpResponse.json(columns)),
      ],
    },
  },
};
