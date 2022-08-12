import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  events: {
    id: 'ReactShared.AgendaAdminModContextBar.events',
    defaultMessage: 'Events in this calendar'
  },
  empty: {
    id: 'ReactShared.AgendaAdminModContextBar.empty',
    defaultMessage: 'This calendar is empty'
  },
  refused: {
    id: 'ReactShared.AgendaAdminModContextBar.refused',
    defaultMessage: '{count, plural, one {1 refused} other {# refused}}'
  },
  moderated: {
    id: 'ReactShared.AgendaAdminModContextBar.moderated',
    defaultMessage: '{count, plural, one {1 to be moderated} other {# to be moderated}}'
  },
  readyToPublish: {
    id: 'ReactShared.AgendaAdminModContextBar.readyToPublish',
    defaultMessage: '{count, plural, one {1 ready to publish} other {# ready to publish}}'
  },
  published: {
    id: 'ReactShared.AgendaAdminModContextBar.published',
    defaultMessage: '{count, plural, one {1 published} other {# published}}'
  },
  manage: {
    id: 'ReactShared.AgendaAdminModContextBar.manage',
    defaultMessage: 'Manage'
  }
});

const slugify = states => states.map(s => ({
  ...s,
  slug: ({
    'state-1': 'refused',
    state0: 'moderated',
    state1: 'readyToPublish',
    state2: 'published'
  })[`state${s.key}`]
}));

export default function AgendaAdminModContextBar({
  res,
  states
}) {
  const intl = useIntl();
  const m = intl.formatMessage;

  const sluggedStates = slugify(states);

  return (
    <div className="edge-bar">
      <ul className="edge-list">
        <li className="edge-item w100" key="unique-context-bar-item">
          <span className="edge-info">{m(messages.events)}:&nbsp;
            {states.length === 0 ? m(messages.empty) : (
              sluggedStates.map(({ eventCount, key, slug }, index) => (
                <span key={slug}>
                  <a
                    href={`${res}?q.state[]=${key}`}
                    className="btn btn-link padding-h-z"
                  >
                    {m(messages[slug], { count: eventCount })}
                  </a>
                  {index < sluggedStates.length - 1 ? ' · ' : null}
                </span>
              ))
            )}
            <a
              className="btn edge-btn btn-default margin-all-xs margin-right-z primary-action"
              href={res}
            >
              <i className="fa fa-cogs" />&nbsp;{m(messages.manage)}
            </a>
          </span>
        </li>
      </ul>
    </div>
  );
}
