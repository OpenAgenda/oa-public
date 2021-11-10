import '@openagenda/bs-templates/compiled/main.css';

import componentFromFixtures from './utils/componentFromFixtures';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Event step',
  decorators: [ProvidersDecorator]
};

/**
 * match with fixtures is made using agenda uid (second argument of componentFromFixtures)
 */

export const NewEventForm = componentFromFixtures(
  `Contributor is shown standard event form for entering a new event.
  Location search presents location list.`,
  100
);

export const EditEventForm = componentFromFixtures(
  'Contributor is shown standard event form for editing an event.',
  101, '/event/01'
);
