import debug from 'debug';
import React from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { matchPath } from 'react-router';
import { useSelector } from 'react-redux';

import locales from '../locales-compiled';
import usePrefix from '../hooks/usePrefix';
import useMember from '../hooks/useMember';
import Loading from '../components/Loading';
import ClosedMessage from '../components/ClosedMessage';
import Canvas from '../components/Canvas';

import contributeReducer from '../reducers/contribute';

import utils from '../lib/utils';

const {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole,
  matchStepPath
} = utils;

const log = debug('App');

function App(props) {
  const {
    route,
    agenda,
    lang,
    history
  } = props;
  log('Requested %s', history.location.pathname);

  const {
    memberIsLoading,
    memberIsFresh,
    member
  } = useMember(agenda);

  const res = useSelector(state => state.res);

  const createdEvent = useSelector(state => state.contribute?.createdEvent);

  const prefix = usePrefix(agenda);

  const replaceWithStep = step => {
    history.replace({
      ...history.location,
      pathname: `${prefix}/${step}`
    });
    return null;
  };

  const isBasePathRequested = matchPath(history.location.pathname, { path: prefix, exact: true });

  if (memberIsLoading) {
    return <Loading />;
  }

  if (
    isBasePathRequested
    && isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && !isMemberDataRequired(agenda)
  ) {
    log('  Base path is requested, contributor data is not required by agenda. Redirecting to event step');
    return replaceWithStep('event');
  }

  if (
    isBasePathRequested
    && isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberRole(member, 'contributor')
    && (
      !isMemberDataRequired(agenda)
      || (isMemberDataComplete(member) && memberIsFresh)
    )
  ) {
    log('  Contributor is not required to fill member form or his data is complete. Redirecting to event form');
    return replaceWithStep('event');
  }

  if (
    isBasePathRequested
    && isMemberRole(member, ['administrator', 'moderator'])
  ) {
    log('  Member is adminmod. Redirecting to event step');
    return replaceWithStep('event');
  }

  if (isBasePathRequested) {
    log('  Base path is requested and non of the conditions above match, going to event step');
    return replaceWithStep('member');
  }

  if (
    !matchStepPath(history, prefix, 'member')
    && isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberDataRequired(agenda)
    && !isMemberRole(member, ['administrator', 'moderator'])
    && (!member || !isMemberDataComplete(member))
  ) {
    log('  Base path is requested, user is not a member. Redirecting to member step');
    return replaceWithStep('member');
  }

  if (
    matchStepPath(history, prefix, 'confirmation')
    && !createdEvent
  ) {
    log('  Attempting to reach confirmation screen without a created event. Redirecting to event step');
    return replaceWithStep('event');
  }

  if (!member && isContributionType(agenda, 'MEMBERS_ONLY')) {
    window.location.href = res.requestContribute.replace(':agendaSlug', agenda.slug);
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

  log('looking for route matching %s', history.location.pathname);

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

export default provideHooks({
  inject: ({ store }) => store.inject({
    contribute: contributeReducer
  })
})(App);
