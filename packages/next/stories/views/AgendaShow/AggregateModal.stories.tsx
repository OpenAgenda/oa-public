import { rest } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import Providers from 'Providers';
import AggregateModal from 'views/AgendaShow/components/AggregateModal';
import AgendaShow from 'views/AgendaShow';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import userFixtures from './fixtures/user.json';
import aggregateModalAgendas from './fixtures/aggregateModalAgendas.json';

export default {
  title: 'AgendaShow/AggregateModal',
  component: AggregateModal,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

export function NotConnected(_args, { loaded: { intlMessages } }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Button variant="primary" onClick={onOpen}>Open modal</Button>

      <AggregateModal
        isOpen={isOpen}
        onClose={onClose}
        agenda={agendaFixtures}
      />
    </Providers>
  );
}

NotConnected.parameters = {
  msw: {
    handlers: [
      rest.get('/users/me', (req, res, ctx) => res(ctx.status(401))),
    ],
  },
};

export function Connected(_args, { loaded: { intlMessages } }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Button variant="primary" onClick={onOpen}>Open modal</Button>

      <AggregateModal
        isOpen={isOpen}
        onClose={onClose}
        agenda={agendaFixtures}
      />
    </Providers>
  );
}

Connected.parameters = {
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
};
