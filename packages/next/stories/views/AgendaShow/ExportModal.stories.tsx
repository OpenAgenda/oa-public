import { rest } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';

import Providers from 'Providers';
import AgendaShow from 'views/AgendaShow';
import ExportModal from 'views/AgendaShow/components/ExportModal';
import me from './fixtures/me.json';
import userFixtures from './fixtures/user.json';
import columns from './fixtures/columns.json';

export default {
  title: 'views/AgendaShow/ExportModal',
  component: ExportModal,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

export function Basic(_args, { loaded: { intlMessages } }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Button variant="primary" onClick={onOpen}>Open modal</Button>

      <ExportModal
        isOpen={isOpen}
        onClose={onClose}
        agendaUid="1234"
      />
    </Providers>
  );
}

Basic.parameters = {
  msw: {
    handlers: [
      rest.get('/users/me', (req, res, ctx) => res(
        ctx.json(userFixtures),
      )),
      rest.get('/api/me', (req, res, ctx) => res(
        ctx.json(me),
      )),
      rest.get('/agendas/1234/settings/exports', (req, res, ctx) => res(
        ctx.json(columns),
      )),
    ],
  },
};
