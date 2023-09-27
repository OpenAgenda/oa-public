import { rest } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import AggregateModal from 'views/AgendaShow/components/AggregateModal';
import AgendaShow from 'views/AgendaShow';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import userFixtures from './fixtures/user.json';
import aggregateModalAgendas from './fixtures/aggregateModalAgendas.json';

export default {
  title: 'views/AgendaShow/AggregateModal',
  component: AggregateModal,
  loaders: [
    intlMessagesLoader(AgendaShow.fetchLocale),
  ],
  decorators: [ProvidersDecorator],
};

export const NotConnected = {
  render: function Render() {
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    return (
      <>
        <Button variant="primary" onClick={onOpen}>Open modal</Button>

        <AggregateModal
          isOpen={isOpen}
          onClose={onClose}
          agenda={agendaFixtures}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/users/me', (req, res, ctx) => res(ctx.status(401))),
      ],
    },
  },
};

export const Connected = {
  render: function Render() {
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    return (
      <>
        <Button variant="primary" onClick={onOpen}>Open modal</Button>

        <AggregateModal
          isOpen={isOpen}
          onClose={onClose}
          agenda={agendaFixtures}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/users/me', (req, res, ctx) => res(
          ctx.json(userFixtures),
        )),
        rest.get('/home/agendas', (req, res, ctx) => res(
          ctx.json(aggregateModalAgendas),
        )),
      ],
    },
  },
};
