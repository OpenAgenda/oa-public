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

export const ShareEventFormWithoutEditionRightsAndNoAdditionalFields = componentFromFixtures(
  `Contributor shares event published in other agenda
  and does not have edition rights. Target agenda does not have additional fields.
  Share is made, completion screen appears allowing to go back or to load shared event in
  destination agenda`,
  302, '/event/01/from/5679'
);

export const EventWasShared = componentFromFixtures(
  'Contributor shared the event. Confirmation screen is displayed',
  303, '/event/01/from/5680'
);

export const ShareEventWithEditionRightsAndAdditionalFields = componentFromFixtures(
  `Contributor shares event published in other agenda and has edition rights.
  Target agenda has additional fields without dependencies. Only additional fields are
  shown at load`,
  304, '/event/01/from/5681'
);

export const ShareEventWithEditionRightsAndNoAdditionalFields = componentFromFixtures(
  `Contributor shares event published in other agenda and has edition rights.
  Target agenda has no additional fields. Share should be triggered`,
  305, '/event/01/from/5682'
);

export const AdminShareEventWithEditionRightsAndNoAdditionalFields = componentFromFixtures(
  `Administrator shares event published in other agenda and has edition rights.
  Target agenda has no additional fields. State selection input should be displayed`,
  306, '/event/01/from/5683'
);

export const AdminShareAlreadySharedEvent = componentFromFixtures(
  `Contributor attempts to share event which was already shared on target agenda. 
  A message informs him and navigation actions allow him to go back to where the share originated from`,
  307, '/event/01/from/5684'
);

export const ShareIncompleteEventWithEditRights = componentFromFixtures(
  `Contributor shares event which is incomplete according to schema of target agenda.
  All fields are shown. Story similar to 301 except here event can be completed.`,
  308, '/event/01/from/5685'
);
