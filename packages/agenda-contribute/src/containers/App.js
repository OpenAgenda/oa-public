import debug from 'debug';
import React, { useEffect } from 'react';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import { locales as sharedLocales } from '@openagenda/react-shared';
import { locales as memberLocales } from '@openagenda/member-apps';
import commonLocales from '@openagenda/common-labels';

import locales from '../locales-compiled';
import usePrefix from '../hooks/usePrefix';
import useAgendaContext from '../hooks/useAgendaContext';

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
  replaceWithStep,
  doRedirect
} = utils;

const log = debug('App');

const mergedLocales = mergeLocales(locales, memberLocales, sharedLocales, commonLocales);

function App(props) {
  const {
    route,
    agenda,
    lang,
    history
  } = props;

  const location = useLocation();
  log('Requested %s', location.pathname);

  const {
    agendaContextIsLoading,
    agendaContext
  } = useAgendaContext(agenda.uid, 'App');

  const res = useSelector(state => state.res);

  const prefix = usePrefix(agenda);

  const shouldGoToFirstStep = !agendaContextIsLoading
    && !matchStepPath(location, prefix, 'member')
    && isContributionType(agenda, ['OPEN', 'MEMBERS_ONLY'])
    && isMemberDataRequired(agenda)
    && !isMemberRole(agendaContext?.me?.member, ['administrator', 'moderator'])
    && (!agendaContext?.me?.member || !isMemberDataComplete(agendaContext?.me?.member));

  useEffect(() => {
    if (!shouldGoToFirstStep) {
      return;
    }

    log('  Base path is requested, user is not a member. Redirecting to member step');
    replaceWithStep(history, location, prefix, 'member');
  }, [shouldGoToFirstStep, history, prefix, location]);

  if (agendaContextIsLoading || shouldGoToFirstStep) {
    return <Loading />;
  }

  if (!agendaContext?.me?.member && isContributionType(agenda, 'MEMBERS_ONLY')) {
    log('  This is a members only agenda, redirecting to request to become a member');
    doRedirect(history, location, res.requestContribute.replace(':agendaSlug', agenda.slug), { ignoreURLRedirect: true });
    return <Loading />;
  }

  const showClosedMessage = (
    !isMemberRole(agendaContext?.me?.member, ['administrator', 'moderator'])
    && isContributionType(agenda, 'CLOSED')
  );

  log('looking for route matching %s', location.pathname);

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={mergedLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >{
      showClosedMessage ? (
        <Canvas>
          <div className="margin-top-lg">
            <ClosedMessage memberRole="contributor" />
          </div>
        </Canvas>
      ) : (
        renderRoutes(route.routes, {
          agenda
        })
      )
    }
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    contribute: contributeReducer
  })
})(App);
