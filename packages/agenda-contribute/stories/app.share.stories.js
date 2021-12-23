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
  300, '/event/01/from/1234?redirect=aHR0cHM6Ly9kLm9wZW5hZ2VuZGEuY29tL2FnZW5kYXMvMTYzODc2MDMvZXZlbnRzLzcwODIyMDM0'
);

export const ShareEventFormToConstrainedAgenda = componentFromFixtures(
  `Constributor shares event published in other agenda
  and does not have edition rights over event. Agenda where
  the event is to be shared on has its standard fields more 
  constrained than in the ones of the default event schema`,
  301, '/event/01/from/5678'
);
