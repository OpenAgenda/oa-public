import React, { useState } from 'react';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import '@openagenda/bs-templates/compiled/main.css';
import createApp from '../client/src';
import ProvidersDecorator from './decorators/Providers';

import fixtures from './fixtures';

const memberFreshness = new Date();
memberFreshness.setMonth(memberFreshness.getMonth() - 6);

const initialState = {
  apiRoot: `http://localhost:${process.env.STORYBOOK_API_PORT}`,
  prefix: '/:agendaSlug/contribute',
  res: {
    member: '/api/me/agendas/:agendaUid',
    requestContribute: '/:agendaSlug/request-contribute/conversation/create/thiswillbreakthestorybook',
    detailedSchema: '/api/agendas/:agendaUid', // ?detailed=1&includeNonDataFields=1',
    locations: {
      get: '/locations/:uid.json',
      index: '/agendas/:agendaUid/locations.json?sample=1',
      create: '/agendas/:agendaUid/locations',
      geocode: '/locations/geocode',
      reverse: '/locations/geocode/reverse',
      insee: '/locations/insee',
      default: '/agendas/:agendaUid/locations',
    },
    references: '/api/agendas/:agendaUid/events',
    suggestions: '/agendas/:agendaUid/events/suggestions',
    suggestChangeRes: '/:agendaSlug/admin/events/:eventSlug/contact'
  },
  memberFreshness,
  files: {
    maxSize: 200000000,
    store: {
      type: 's3',
      bucket: 'oadev'
    }
  },
  tiles: 'https://map.tiles'
};

export default {
  title: 'App - Member evaluation',
  decorators: [ProvidersDecorator]
};

function componentFromFixtures(message, agendaUid) {
  return () => (
    <>
      <p className="text-center"><strong>{message}</strong></p>
      {wrapApp(
        createApp({
          initialState,
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: fixtures(agendaUid).extraProps
        }
      )}
    </>
  );
}

export const ContributorGoesToEventStepAfterMemberFormSubmit = componentFromFixtures(
  'Contributor is shown event form upon successful submission of member form data. Press the save button.', 1
);

export const MemberIsAdminModAndDataIsIncomplete = componentFromFixtures(
  'User is AdminMod and member data is incomplete. Event form is presented anyways.', 2
);

export const MemberIsContributorAndDataIsCompleteAndFresh = componentFromFixtures(
  'Agenda is open, contributor data is complete and fresh. Event form is presented. User can go back to the first step by clicking on it.', 3
);

export const MemberIsContributorAndDataIsCompleteButIsOld = componentFromFixtures(
  'Agenda is open, contributor data is complete but has not been refreshed recently. User is redirected to the member step.', 4
);

export const MemberDataRequiredAndContributorIsIncomplete = componentFromFixtures(
  'Agenda is open but requires member data. User is a contributor with an incomplete form. He is shown the member form.', 5
);

export const NonMemberOnMembersOnly = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <p className="text-center">
        <strong>Agenda is restricted to members and user is not a member yet. He is redirected to a conversation form to request to become member. Expect a 404 to appear in the storybook</strong>
      </p>
      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsLoaded(true)}
        >
          Load app
        </button>
      </div>
      {isLoaded ? wrapApp(
        createApp({
          initialState,
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: fixtures(6).extraProps
        }
      ) : null}
    </>
  );
};

export const ClosedAgendaForAdminMods = componentFromFixtures(
  'Agenda is closed to contributions. AdminMod can access form but is notified of the closed state', 7
);

export const ClosedAgendaForContributor = componentFromFixtures(
  'Agenda is closed to contributions. Contributor is faced with a message indicating he cannot contribute', 8
);
