import { Box, Container } from '@openagenda/uikit';
import AgendaHeader from 'views/EventShow/components/AgendaHeader';
import EventShow from 'views/EventShow';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';

import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

import agendaWithNetwork from '../../fixtures/tam.agenda.json';
import agendaWithoutNetwork from '../../fixtures/a-qui-le-tour.agenda.json';

export default {
  title: 'views/EventShow/AgendaHeader',
  component: AgendaHeader,
  loaders: [intlMessagesLoader(EventShow.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const BasicHeader = () => (
  <AgendaProvider agenda={agendaWithoutNetwork}>
    <Box as="header" w="full" bg="#413a42">
      <Container maxW="container.xl" color="white">
        <AgendaHeader />
      </Container>
    </Box>
  </AgendaProvider>
);

export const HeaderWithNetwork = () => (
  <AgendaProvider agenda={agendaWithNetwork}>
    <Box as="header" w="full" bg="#413a42">
      <Container maxW="container.xl" color="white">
        <AgendaHeader />
      </Container>
    </Box>
  </AgendaProvider>
);
