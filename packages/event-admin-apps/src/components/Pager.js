import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cn from 'classnames';

const PAGE_SIZE = 20;

const messages = defineMessages({
  previous: {
    id: 'EventAdminApp.Dashboard.previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'EventAdminApp.Dashboard.next',
    defaultMessage: 'Next',
  },
});

export default function Pager({
  events,
  page,
  previousPage,
  nextPage,
  className,
}) {
  const intl = useIntl();

  return (
    <nav>
      <ul className={cn('pager', className)}>
        <li
          className="margin-right-xs"
          title={intl.formatMessage(messages.previous)}
        >
          <span
            tabIndex={0}
            role="button"
            onClick={previousPage}
            onKeyPress={previousPage}
          >
            <i className="fa fa-lg fa-angle-left" />
          </span>
        </li>
        <li className="margin-right-xs">
          {page * PAGE_SIZE + 1} – {page * PAGE_SIZE + events.length}
        </li>
        <li title={intl.formatMessage(messages.next)}>
          <span
            tabIndex={0}
            role="button"
            onClick={nextPage}
            onKeyPress={nextPage}
          >
            <i className="fa fa-lg fa-angle-right" />
          </span>
        </li>
      </ul>
    </nav>
  );
}
