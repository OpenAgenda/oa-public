import '@openagenda/bs-templates/compiled/main.css';
import qs from 'qs';

import componentFromFixtures from './utils/componentFromFixtures';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Step 2: Event',
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

export const NewEventFormWithDefaults = componentFromFixtures(
  'Contributor is shown event form with default values loaded through URL',
  102, qs.stringify({
    defaults: {
      event: {
        title: {
          fr: 'Un titre par défaut'
        }
      }
    }
  }, { addQueryPrefix: true })
);
