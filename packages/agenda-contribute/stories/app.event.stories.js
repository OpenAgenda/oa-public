import '@openagenda/bs-templates/compiled/main.css';
import qs from 'qs';

import componentFromFixtures from './utils/componentFromFixtures';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Step 2: Event',
  decorators: [ProvidersDecorator],
};

/**
 * match with fixtures is made using agenda uid (second argument of componentFromFixtures)
 */

export const NewEventForm = componentFromFixtures(
  `Contributor is shown standard event form for entering a new event.
  Location search presents location list.`,
  100,
);

export const EditEventForm = componentFromFixtures(
  'Contributor is shown standard event form for editing an event. State change select is not available.',
  101,

  '/event/01',
);

export const NewEventFormWithDefaults = componentFromFixtures(
  'Contributor is shown event form with default values loaded through URL',
  102,

  qs.stringify({
    defaults: {
      event: {
        title: {
          fr: 'Un titre par défaut',
        },
      },
    },
  }, { addQueryPrefix: true }),
);

export const NewEventFormWithTwoLanguageTabsOpened = componentFromFixtures(
  'Contributor is shown event form with two language tabs opened',
  103,
);

export const EventCreateLeadsToCompletionStep = componentFromFixtures(
  'When event is created, contributor goes to completing step',
  103,

  qs.stringify({
    defaults: {
      event: {
        title: {
          fr: 'Un titre par défaut',
        },
        description: {
          fr: 'Une description par défaut',
        },
        location: {
          uid: 28723185,
        },
        timings: [{
          begin: {
            date: '2022-06-17',
            hours: 13,
            minutes: 30,
          },
          end: {
            date: '2022-06-17',
            hours: 17,
            minutes: 30,
          },
        }],
      },
    },
  }, { addQueryPrefix: true }),
);

export const EditDraftEventForm = componentFromFixtures(
  'Edited draft event is shown in steppered layout',
  104,

  '/event/02/draft',
);

export const EditDraftEventFormFromEditRoute = componentFromFixtures(
  'Draft event loaded from non draft route is redirected to draft route',
  105,

  '/event/03',
);

export const AdminEditEventForm = componentFromFixtures(
  'Administrator is shown standard event form for editing an event. State change select is available.',
  106,

  '/event/01',
);

export const EditEventFormByAdminWithoutEditRights = componentFromFixtures(
  'Component informing member that event edition is not permitted is shown above form',
  107,

  '/event/01',
);

export const EventCreateByDuplication = componentFromFixtures(
  'Event is create using data taken from another event',
  108,

  '?agendaUid=109&eventUid=21832558',
);

export const Event502 = componentFromFixtures(
  'Server returns a 502 error when the contributor attempts a save. The app should not crash and invite the user to resubmit after a short while',
  110,
  '/event/01',
);
