import Agenda from '../../../pages/n/[slug]';
import {
  ChakraProvider,
  theme
} from '@openagenda/uikit';

import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from '../../fixtures/mel.events.json';

export default {
  title: 'Sample story',
  component: Agenda
}

export const Sample = () => (
  <ChakraProvider theme={theme}>
    <Agenda
      agenda={agendaFixtures}
      events={eventsFixtures}
    />
  </ChakraProvider>
);
