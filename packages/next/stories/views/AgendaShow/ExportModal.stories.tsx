import { rest } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import AgendaShow from 'views/AgendaShow';
import ExportModal from 'views/AgendaShow/components/ExportModal';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import me from './fixtures/me.json';
import userFixtures from './fixtures/user.json';
import columns from './fixtures/columns.json';

export default {
  title: 'views/AgendaShow/ExportModal',
  component: ExportModal,
  loaders: [
    intlMessagesLoader(AgendaShow.fetchLocale),
  ],
  decorators: [
    ProvidersDecorator,
  ],
};

export const Basic = {
  render: function Render() {
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    return (
      <>
        <Button variant="primary" onClick={onOpen}>Open modal</Button>

        <ExportModal
          isOpen={isOpen}
          onClose={onClose}
          agendaUid="1234"
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
        rest.get('/api/me', (req, res, ctx) => res(
          ctx.json(me),
        )),
        rest.get('/agendas/1234/settings/exports', (req, res, ctx) => res(
          ctx.json(columns),
        )),
      ],
    },
  },
};
