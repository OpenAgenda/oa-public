import debug from 'debug';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useSelector } from 'react-redux';

import Loading from '../components/Loading';
import ClosedMessage from '../components/ClosedMessage';
import Canvas from '../components/Canvas';
import locales from '../locales-compiled';
import utils from '../lib/utils';
import useMember from '../lib/useMember';

const {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole,
  matchStepPath
} = utils;

const log = debug('App');

export default function App(props) {
  const {
    route,
    agenda,
    lang,
    match,
    history
  } = props;

  log(history.location.pathname);

  const res = useSelector(state => state.res);
  const prefix = useSelector(state => state.prefix);
  const memberFreshness = useSelector(state => state.memberFreshness);

  const {
    memberIsLoading,
    member
  } = useMember(agenda);

  if (memberIsLoading) {
    return <Loading />;
  }

  const memberIsFresh = new Date(member?.updatedAt) > new Date(memberFreshness);

  if (
    isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberRole(member, 'contributor')
    && isMemberDataRequired(agenda)
    && (!isMemberDataComplete(member) || !memberIsFresh)
    && !matchStepPath(history, prefix, 'member')
  ) {
    log('  Contributor is %s on an agenda requiring data. Redirecting to member form', memberIsFresh ? 'not fresh' : 'incomplete');
    history.replace(`${prefix}/member`);
    return <Loading />;
  }

  if (
    isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberRole(member, 'contributor')
    && (!isMemberDataRequired(agenda) || (isMemberDataComplete(member) && memberIsFresh))
    && !matchStepPath(history, prefix, ['event', 'member'])
  ) {
    log('  Contributor is not required to fill member form or his data is complete. Redirecting to event form');
    history.replace(`${prefix}/event`);
    return <Loading />;
  }

  if (
    isMemberRole(member, ['administrator', 'moderator'])
    && !matchStepPath(history, prefix, ['event', 'member', 'confirmation'])
  ) {
    log('  AdminMod is not explicitely requesting a specific step. Redirecting to event form');
    history.replace(`${prefix}/event`);
  }

  if (
    !isMemberRole(member, ['administrator', 'moderator'])
    && isContributionType(agenda, 'CLOSED')
  ) {
    return (
      <Canvas>
        <ClosedMessage memberRole="contributor" />
      </Canvas>
    );
  }

  if (!member && isContributionType(agenda, 'MEMBERS_ONLY')) {
    window.location.href = res.requestContribute.replace(':agendaSlug', agenda.slug);
    return <Loading />;
  }

  if (match.isExact) {
    return <Loading />;
  }

  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      {renderRoutes(route.routes, {
        agenda
      })}
    </IntlProvider>
  );
}
