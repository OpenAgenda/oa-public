import { http, HttpResponse } from 'msw';
import { Button, useDisclosure } from '@openagenda/uikit';
import ShareModal from '../../../src/views/EventShow/components/ShareModal';
import EventShow from '../../../src/views/EventShow';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendasFixtures from '../../fixtures/aggregateModalAgendas.json';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventFixtures from '../../fixtures/events/sample.json';
import userFixtures from '../../fixtures/user.json';

export default {
  title: 'views/EventShow/ShareModal',
  component: ShareModal,
  loaders: [intlMessagesLoader(EventShow.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Default = {
  render: function Render() {
    const { open, onOpen, onClose } = useDisclosure({ defaultOpen: true });

    return (
      <>
        <Button onClick={onOpen}>Open modal</Button>

        <ShareModal
          isOpen={open}
          onClose={onClose}
          agenda={agendaFixtures}
          event={eventFixtures}
          contentLocale={'fr'}
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
