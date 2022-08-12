import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import EventSelection from './EventSelection';
import Modal from './Modal';

const messages = defineMessages({
  myEvents: {
    id: 'ReactShared.AgendaContextBar.myEvents',
    defaultMessage: 'My events in this calendar'
  },
  drafts: {
    id: 'ReactShared.AgendaContextBar.drafts',
    defaultMessage: '{count, plural, one {1 draft} other {# drafts}}'
  },
  moderated: {
    id: 'ReactShared.AgendaContextBar.moderated',
    defaultMessage: '{count} in moderation'
  },
  published: {
    id: 'ReactShared.AgendaContextBar.published',
    defaultMessage: '{count, plural, one {1 published} other {# published}}'
  },
  refused: {
    id: 'ReactShared.AgendaContextBar.refused',
    defaultMessage: '{count, plural, one {1 refused} other {# refused}}'
  },
  draftsModalTitle: {
    id: 'ReactShared.AgendaContextBar.draftsModalTitle',
    defaultMessage: 'Drafts'
  },
  draftsModalInfo: {
    id: 'ReactShared.AgendaContextBar.draftsModalInfo',
    defaultMessage: 'These are the draft you saved. They are not visible to the calendar moderators. They must be completed and submitted before they can be moderated and published.'
  },
  moderatedModalTitle: {
    id: 'ReactShared.AgendaContextBar.moderatedModalTitle',
    defaultMessage: 'Events in moderation'
  },
  moderatedModalInfo: {
    id: 'ReactShared.AgendaContextBar.moderatedModalInfo',
    defaultMessage: 'These events have been submitted to the agenda for moderation but have not yet been published.'
  },
  refusedModalTitle: {
    id: 'ReactShared.AgendaContextBar.refusedModalTitle',
    defaultMessage: 'Refused events'
  },
  refusedModalInfo: {
    id: 'ReactShared.AgendaContextBar.refusedModalInfo',
    defaultMessage: 'These events have been submitted but have been refused by the moderators. They will not be published.'
  },
  publishedModalTitle: {
    id: 'ReactShared.AgendaContextBar.publishedModalTitle',
    defaultMessage: 'Published events'
  },
  publishedModalInfo: {
    id: 'ReactShared.AgendaContextBar.publishedModalInfo',
    defaultMessage: 'These events have been published and are accessible by the viewers of the calendar'
  }
});

function DraftModal({
  onClose,
  res,
  actions,
  m
}) {
  return (
    <Modal
      onClose={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <EventSelection
        title={m(messages.draftsModalTitle)}
        info={m(messages.draftsModalInfo)}
        infoType="warning"
        res={res}
        actions={actions}
      />
    </Modal>
  );
}

function StateModal({
  onClose,
  res,
  state,
  slug,
  actions,
  m
}) {
  const query = [].concat(state).map(s => `state[]=${s}`).join('&');
  return (
    <Modal
      onClose={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <EventSelection
        title={m(messages[`${slug}ModalTitle`])}
        info={m(messages[`${slug}ModalInfo`])}
        res={`${res}?${query}`}
        actions={actions}
      />
    </Modal>
  );
}

export default function AgendaContextBar({
  actions,
  states,
  drafts,
  res
}) {
  const intl = useIntl();
  const m = intl.formatMessage;
  const [displayedModal, setDisplayedModal] = useState(null);

  const bundledStates = states.reduce((bundled, { key, eventCount }) => {
    if ([0, 1].includes(key)) {
      bundled[1].eventCount += eventCount;
    } else {
      bundled[key === 2 ? 2 : 0].eventCount += eventCount;
    }
    return bundled;
  }, [{
    key: -1,
    eventCount: 0,
    slug: 'refused'
  }, {
    key: [0, 1],
    eventCount: 0,
    slug: 'moderated'
  }, {
    key: 2,
    eventCount: 0,
    slug: 'published'
  }]).filter(s => !!s.eventCount);

  return (
    <>
      {displayedModal && displayedModal.type === 'draft' ? (
        <DraftModal
          res={res.drafts}
          onClose={() => setDisplayedModal(null)}
          actions={actions.drafts}
          m={m}
        />
      ) : null}
      {displayedModal && displayedModal.type === 'state' ? (
        <StateModal
          res={res.events}
          state={displayedModal.state}
          slug={displayedModal.slug}
          onClose={() => setDisplayedModal(null)}
          actions={actions.events}
          m={m}
        />
      ) : null}
      <div className="edge-bar">
        <ul className="edge-list">
          <li className="edge-item w100" key="unique-context-bar-item">
            <span className="edge-info">{m(messages.myEvents)}:
              {drafts ? (
                <button
                  disabled={!!displayedModal}
                  type="button"
                  className="btn btn-link padding-right-z padding-left-xs"
                  onClick={(() => setDisplayedModal({ type: 'draft' }))}
                >
                  {m(messages.drafts, { count: drafts })}
                </button>
              ) : null}
              {drafts && states.length ? ' · ' : null}
              {bundledStates.length ? bundledStates.map(({ key, eventCount, slug }, index) => (
                <span key={`state${key}`}>
                  <button
                    disabled={!!displayedModal}
                    type="button"
                    className="btn btn-link padding-h-z"
                    onClick={(() => setDisplayedModal({ type: 'state', state: key, slug }))}
                  >
                    {m(messages[slug], { count: eventCount })}
                  </button>
                  {index < bundledStates.length - 1 ? ' · ' : null}
                </span>
              )) : null}
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}
