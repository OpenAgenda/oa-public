import Next from '../../../pages/n/[slug]';
import {
  ChakraProvider,
  theme
} from '@openagenda/uikit';

import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from '../../fixtures/mel.events.json';

export default {
  title: 'Sample story',
  component: Next
}

export const Sample = () => (
  <ChakraProvider theme={theme}>
    <Next
      agenda={agendaFixtures}
      events={eventsFixtures}
    />
  </ChakraProvider>
);
