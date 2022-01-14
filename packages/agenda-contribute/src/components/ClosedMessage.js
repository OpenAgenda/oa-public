import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  forContributors: {
    id: 'AgendaContribute.ClosedMessage.forContributors',
    defaultMessage: 'This agenda is not or no longer open for new contributions.'
  },
  forAdminModerators: {
    id: 'AgendaContribute.ClosedMessage.forAdminModerators',
    defaultMessage: 'This agenda is currently not open to contributors.'
  }
});

export default ({ memberRole, className }) => {
  const m = useIntl().formatMessage;

  if (['administrator', 'moderator'].includes(memberRole)) {
    return (
      <div className={`event-instruction boxed warning padding-all-md ${className ?? ''}`}>
        <p className="text-center padding-all-z margin-all-z">{m(messages.forAdminModerators)}</p>
      </div>
    );
  }

  return (
    <div className={`event-instruction boxed margin-top-lg padding-all-md ${className ?? ''}`}>
      <p className="text-center padding-all-z margin-all-z">{m(messages.forContributors)}</p>
    </div>
  );
};
