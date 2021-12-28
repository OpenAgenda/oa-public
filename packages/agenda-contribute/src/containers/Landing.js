import debug from 'debug';
import React, { useEffect } from 'react';

import Loading from '../components/Loading';

import utils from '../lib/utils';
import usePrefix from '../hooks/usePrefix';
import useAgendaContext from '../hooks/useAgendaContext';

const {
  isMemberDataComplete,
  replaceWithStep,
  isContributionType,
  isMemberDataRequired,
  isMemberRole
} = utils;

const log = debug('Landing');

export default function Landing({
  agenda,
  history,
  location
}) {
  const prefix = usePrefix(agenda);

  const {
    agendaContextIsLoading,
    memberIsFresh,
    agendaContext
  } = useAgendaContext(agenda.uid);

  useEffect(() => {
    const {
      member
    } = agendaContext.me;

    if (
      isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
      && !isMemberDataRequired(agenda)
    ) {
      log('  Contributor data is not required by agenda. Redirecting to event step');
      return replaceWithStep(history, prefix, 'event');
    }

    if (
      isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
      && isMemberRole(member, 'contributor')
      && (
        !isMemberDataRequired(agenda)
        || (isMemberDataComplete(member) && memberIsFresh)
      )
    ) {
      log('  Contributor is not required to fill member form or his data is complete. Redirecting to event step');
      return replaceWithStep(history, prefix, 'event');
    }

    if (isMemberRole(member, ['administrator', 'moderator'])) {
      log('  Member is adminmod. Redirecting to event step');
      return replaceWithStep(history, prefix, 'event');
    }

    if (!agendaContextIsLoading) {
      replaceWithStep(history, prefix, 'member');
    }
  }, [agendaContextIsLoading, agendaContext, agenda, history, memberIsFresh, prefix, location]);

  return <Loading />;
}
