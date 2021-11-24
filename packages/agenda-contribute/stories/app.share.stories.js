import '@openagenda/bs-templates/compiled/main.css';

import componentFromFixtures from './utils/componentFromFixtures';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Share event',
  decorators: [ProvidersDecorator]
};

export const ShareEventForm = componentFromFixtures(
  `Contributor shares event published in other agenda
  and does not have edition rights over event. Event fields
  are not displayed`,
  300, '/event/01/from/1234'
);
