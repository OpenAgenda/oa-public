import React, { useState } from 'react';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import '@openagenda/bs-templates/compiled/main.css';
import createApp from '../src';
import ProvidersDecorator from './decorators/Providers';

import fixtures from './fixtures';
import loadInitialState from './utils/loadInitialState';
import componentFromFixtures from './utils/componentFromFixtures';

export default {
  title: 'App - Step 1: Member',
  decorators: [ProvidersDecorator]
};

export const ContributorGoesToEventStepAfterMemberFormSubmit = componentFromFixtures(
  `Contributor is shown event form upon successful submission of member form data.
  Press the save button.`,
  1, '/member'
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
          initialState: loadInitialState(),
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
  `Agenda is closed to contributions.
  AdminMod can access form but is notified of the closed state`,
  7
);

export const ClosedAgendaForContributor = componentFromFixtures(
  'Agenda is closed to contributions. Contributor is faced with a message indicating he cannot contribute', 8
);

export const NonMemberIsShownMemberFormOnContributiveAgenda = componentFromFixtures(
  'Agenda is open to anyone and requires new members to type in their member information', 9
);

export const NonMemberIsShownEventFormOnAgendaNotRequestingMemberInfo = componentFromFixtures(
  'Non member goes to event form on agenda not requiring member information', 10
);
