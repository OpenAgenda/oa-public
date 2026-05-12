import { http, HttpResponse } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import AgendaExportModal from '../src/components/AgendaExportModal';
import fetchLocale from '../src/fetchLocale';
import { Agenda } from '../src/types';
import intlMessagesLoader from './loaders/intlMessagesLoader';
import ProvidersDecorator from './decorators/ProvidersDecorator';
import agendaFixtures from './fixtures/mel.agenda.json';
import userFixtures from './fixtures/user.json';
import me from './fixtures/me.json';
import columns from './fixtures/columns.json';

const meta: Meta<typeof AgendaExportModal> = {
  component: AgendaExportModal,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
};

export default meta;

type Story = StoryObj<typeof AgendaExportModal>;

export const Basic: Story = {
  render: function Render(): React.JSX.Element {
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

export const OpenAccordion: Story = {
  render: function Render(): React.JSX.Element {
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
