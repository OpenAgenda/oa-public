import { Box, Container } from '@openagenda/uikit';
import AgendaHeader from 'views/AgendaShow/components/AgendaHeader';
import AgendaShow from 'views/AgendaShow';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

import agendaWithNetwork from '../../fixtures/tam.agenda.json';
import agendaWithoutNetwork from '../../fixtures/a-qui-le-tour.agenda.json';

export default {
  title: 'views/AgendaShow/AgendaHeader',
  component: AgendaHeader,
  loaders: [intlMessagesLoader(AgendaShow.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const BasicHeader = () => (
  <Box as="header" w="full" bg="#413a42" px="4" py="8">
    <Container maxW="container.xl" color="white">
      <AgendaHeader agenda={agendaWithoutNetwork} />
    </Container>
  </Box>
);

export const HeaderWithNetwork = () => (
  <Box as="header" w="full" bg="#413a42" px="4" py="8">
    <Container maxW="container.xl" color="white">
      <AgendaHeader agenda={agendaWithNetwork} />
    </Container>
  </Box>
);
