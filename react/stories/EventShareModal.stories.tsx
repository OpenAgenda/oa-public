import { http, HttpResponse } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import EventShareModal from '../src/components/EventShareModal';
import fetchLocale from '../src/fetchLocale';
import type { Agenda, Event } from '../src/types';
import intlMessagesLoader from './loaders/intlMessagesLoader';
import ProvidersDecorator from './decorators/ProvidersDecorator';
import agendasFixtures from './fixtures/aggregateModalAgendas.json' with { type: 'json' };
import agendaFixtures from './fixtures/mel.agenda.json' with { type: 'json' };
import eventFixtures from './fixtures/events/sample.json' with { type: 'json' };
import userFixtures from './fixtures/user.json' with { type: 'json' };

const meta: Meta<typeof EventShareModal> = {
  component: EventShareModal,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
};

export default meta;

type Story = StoryObj<typeof EventShareModal>;

export const Default: Story = {
  render: function Render(): React.JSX.Element {
    const { open, onOpen, onClose } = useDisclosure({ defaultOpen: true });

    return (
      <>
        <Button onClick={onOpen}>Open modal</Button>

        <EventShareModal
          isOpen={open}
          onClose={onClose}
          agenda={agendaFixtures as Agenda}
          event={eventFixtures as Event}
          contentLocale="fr"
          onEmailSent={() => {}}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () => HttpResponse.json(userFixtures)),
        http.get('/home/agendas', () => HttpResponse.json(agendasFixtures)),
      ],
    },
  },
};
