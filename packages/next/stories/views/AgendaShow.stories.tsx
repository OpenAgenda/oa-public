import { UIKitProvider } from '@openagenda/uikit';
import Agenda from 'views/AgendaShow';
import agendaFixtures from '../fixtures/mel.agenda.json';
import eventsFixtures from '../fixtures/mel.events.json';

export default {
  title: 'AgendaShow',
  component: Agenda,
};

export function Sample() {
  return (
    <UIKitProvider>
      <Agenda agenda={agendaFixtures} events={eventsFixtures} />
    </UIKitProvider>
  );
}
