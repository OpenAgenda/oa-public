import debug from 'debug';
import React, { useEffect } from 'react';

import Loading from '../components/Loading';

import utils from '../lib/utils';
import usePrefix from '../hooks/usePrefix';
import useMember from '../hooks/useMember';

const {
  isMemberDataComplete,
  replaceWithStep,
  isContributionType,
  isMemberDataRequired,
  isMemberRole
} = utils;

export default function Landing({
  agenda,
  history
}) {
  const log = debug('Landing');
  const prefix = usePrefix(agenda);

  const {
    memberIsLoading,
    memberIsFresh,
    member
  } = useMember(agenda);

  useEffect(() => {
    if (
      isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
      && !isMemberDataRequired(agenda)
    ) {
      log('  Base path is requested, contributor data is not required by agenda. Redirecting to event step');
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
      log('  Contributor is not required to fill member form or his data is complete. Redirecting to event form');
      return replaceWithStep(history, prefix, 'event');
    }

    if (isMemberRole(member, ['administrator', 'moderator'])) {
      log('  Member is adminmod. Redirecting to event step');
      return replaceWithStep(history, prefix, 'event');
    }

    if (!memberIsLoading) {
      replaceWithStep(history, prefix, 'member');
    }
  }, [agenda, history, prefix, memberIsFresh, memberIsLoading, log, member]);

  return <Loading />;
}
