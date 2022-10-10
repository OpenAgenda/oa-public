import { ChakraProvider, theme } from '@openagenda/uikit';
import Agenda from '../../../src/pages/n/[agendaSlug]';

import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from '../../fixtures/mel.events.json';

export default {
  title: 'Sample story',
  component: Agenda,
};

export function Sample() {
  return (
    <ChakraProvider theme={theme}>
      <Agenda agenda={agendaFixtures} events={eventsFixtures} />
    </ChakraProvider>
  );
}
