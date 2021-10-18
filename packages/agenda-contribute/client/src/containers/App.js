import axios from 'axios';
import { useQuery } from 'react-query';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';
import ClosedMessage from '../components/ClosedMessage';
import Canvas from '../components/Canvas';
import locales from '../locales-compiled';
import isMemberDataComplete from '../lib/isMemberDataComplete';

const contributionTypes = {
  CLOSED: 0,
  OPEN: 1,
  MEMBERS_ONLY: 2
};

export default function App(props) {
  const {
    route,
    agenda,
    lang,
    match,
    history
  } = props;

  const res = useSelector(state => state.res);

  const {
    isLoading: memberIsLoading,
    data: member
  } = useQuery('member', () => axios.get(res.member).then(response => (response.data)));

  if (memberIsLoading) {
    return <Loading />;
  }

  // member === null means user is not member

  if (match.isExact && agenda.settings.contribution.type === 1 /* OPEN */) {
    history.replace('/event');
  }

  const isAdminMod = ['administrator', 'moderator'].includes(member?.role);

  if (!isAdminMod && (agenda.settings.contribution.type === contributionTypes.CLOSED)) {
    return (
      <Canvas>
        <ClosedMessage memberRole="contributor" />
      </Canvas>
    );
  }

  if (!member && (agenda.settings.contribution.type === contributionTypes.MEMBERS_ONLY)) {
    window.location.href = res.requestContribute.replace(':agendaSlug', agenda.slug);
    return <Loading />;
  }

  if (!isAdminMod && !isMemberDataComplete(member)) {

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
