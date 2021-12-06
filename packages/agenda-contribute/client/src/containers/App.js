import debug from 'debug';
import React, { useEffect } from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
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
  matchStepPath,
  replaceWithStep
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
    member
  } = useMember(agenda);

  const res = useSelector(state => state.res);

  const prefix = usePrefix(agenda);

  const shouldGoToFirstStep = !memberIsLoading
    && !matchStepPath(history, prefix, 'member')
    && isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberDataRequired(agenda)
    && !isMemberRole(member, ['administrator', 'moderator'])
    && (!member || !isMemberDataComplete(member));

  useEffect(() => {
    log('useEffecting');
    if (!shouldGoToFirstStep) {
      return;
    }

    log('  Base path is requested, user is not a member. Redirecting to member step');
    replaceWithStep(history, prefix, 'member');
  }, []);

  if (memberIsLoading || shouldGoToFirstStep) {
    log('là');
    return <Loading />;
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
