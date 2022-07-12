import React from 'react';
import { defineMessages } from 'react-intl';

import AgendaSearchInput from '../../AgendaSearchInput';
import encodeURL from '../../lib/encodeURL';

const getTitleLink = (agenda, event) => `/${agenda.slug}/contribute/event/${event.uid}/from/${event.agendaUid}?redirect=${encodeURL(`${event.root}/agendas/${event.agendaUid}/events/${event.uid}`)}`;

const messages = defineMessages({
  shareOA: {
    id: 'share-oa',
    defaultMessage: 'Share on OpenAgenda',
  },
  signIn: {
    id: 'sign-in',
    defaultMessage: 'You need to sign in to your account to add this event to your OpenAgendas',
  },
  connectionBtn: {
    id: 'connection-btn',
    defaultMessage: 'Sign In',
  }
});

export default function OpenAgendaShare(props) {
  const {
    userLogged,
    res,
    event,
    preFetch,
    intl
  } = props;

  return (
    <div className="margin-bottom-md">
      <h2 className="export-title-md">{intl.formatMessage(messages.shareOA)}</h2>
      {userLogged ? (
        <AgendaSearchInput
          getTitleLink={agenda => getTitleLink(agenda, event)}
          preFetchAgendas={preFetch}
          res={res}
          targetAgenda={{ title: event.agendaTitle, slug: event.agendaSlug }}
        />
      ) : (
        <>
          <p>{intl.formatMessage(messages.signIn)}</p>
          <a
            className="btn btn-primary export-button"
            href={`${event.root}/${event.agendaSlug}/signin?redirect=${encodeURL(`${event.root}/agendas/${event.agendaUid}/events/${event.uid}?displayShareModal=1`)}`}
          >
            {intl.formatMessage(messages.connectionBtn)}
          </a>
        </>
      )}
    </div>
  );
}
