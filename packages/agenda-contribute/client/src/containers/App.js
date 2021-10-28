import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useSelector } from 'react-redux';
import { matchPath } from 'react-router';

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
  isMemberRole
} = utils;

export default function App(props) {
  const {
    route,
    agenda,
    lang,
    match,
    history
  } = props;
  const res = useSelector(state => state.res);
  const prefix = useSelector(state => state.prefix);
  const memberFreshness = useSelector(state => state.memberFreshness);

  const {
    memberIsLoading,
    member
  } = useMember(res);

  if (memberIsLoading) {
    return <Loading />;
  }

  const memberIsFresh = new Date(member?.updatedAt) > new Date(memberFreshness);

  if (
    isContributionType(agenda, 'OPEN')
    && isMemberRole(member, 'contributor')
    && isMemberDataRequired(agenda)
    && (!isMemberDataComplete(member) || !memberIsFresh)
    && !matchPath(history.location.pathname, { path: `${prefix}/member` })
  ) {
    history.replace(`${prefix}/member`);
    return <Loading />;
  }

  if (
    isContributionType(agenda, 'OPEN')
    && isMemberRole(member, 'contributor')
    && (!isMemberDataRequired(agenda) || (isMemberDataComplete(member) && memberIsFresh))
    && !matchPath(history.location.pathname, { path: `${prefix}/event` })
  ) {
    history.replace(`${prefix}/event`);
    return <Loading />;
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

  // if the member is a contributor and has an incomplete form for a

  // I need to integrate a component informing the user the app is closed to contributions
  //
  // A blocking message for contributors
  //
  // A notification square for adminmods
  //
  // if the contribution type is open, the app can go to event
  // when user hits /contribute with nothing else, he needs to be rerouted to
  // either the member form or the event form depending on 1. the contribution type
  // of the agenda and 2. whether he is a contributor and his data is incomplete.

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
