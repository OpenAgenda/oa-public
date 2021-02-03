import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { css } from '@emotion/react';
import getLocaleValue from '../utils/getLocaleValue';
import StateSelector from './StateSelector';

const messages = defineMessages({
  createdBy: {
    id: 'EventAdminApp.EventItem.createdBy',
    defaultMessage: 'Created by <link>{name}</link>',
  },
  addedBy: {
    id: 'EventAdminApp.EventItem.addedBy',
    defaultMessage: 'Added by <link>{name}</link>',
  },
  aggregatedFrom: {
    id: 'EventAdminApp.EventItem.aggregatedFrom',
    defaultMessage: 'Aggregated from <link>{title}</link>',
  },
  edit: {
    id: 'EventAdminApp.EventItem.edit',
    defaultMessage: 'Edit',
  },
  contact: {
    id: 'EventAdminApp.EventItem.contact',
    defaultMessage: 'Contact',
  },
  showLocation: {
    id: 'EventAdminApp.EventItem.showLocation',
    defaultMessage: 'Show location',
  },
  delete: {
    id: 'EventAdminApp.EventItem.delete',
    defaultMessage: 'Delete',
  },
  remove: {
    id: 'EventAdminApp.EventItem.remove',
    defaultMessage: 'Remove from agenda',
  },
  passed: {
    id: 'EventAdminApp.EventItem.passed',
    defaultMessage: 'Passed',
  },
});

// TODO defined "Passed" badge

export default function EventItem({
  agenda,
  event,
  pageIndex,
  openRemoveModal,
}) {
  const intl = useIntl();

  const isPassed = useMemo(() => {
    if (!event.timings?.length) {
      return false;
    }

    const { timings } = event;
    const endOfLastTiming = new Date(timings[timings.length - 1].end);
    const now = new Date();

    return endOfLastTiming < now;
  }, [event]);

  return (
    <li key={event.uid} className="margin-top-md">
      <div>
        <a
          href={`/${agenda.slug}/events/${event.slug}`}
          css={css`
            color: inherit;
          `}
        >
          <b>{getLocaleValue(event.title, intl.locale)}</b>

          {isPassed ? (
            <span className="badge badge-default margin-left-xs">
              {intl.formatMessage(messages.passed)}
            </span>
          ) : null}
        </a>
      </div>

      <div className="margin-top-xs">
        {event.location.name}, {getLocaleValue(event.dateRange, intl.locale)}
      </div>

      {event.member?.name ? (
        <>
          {event.originAgenda ? (
            <div className="margin-top-xs">
              {intl.formatMessage(messages.addedBy, {
                name: event.member.name,
                link: chunks => <i>{chunks}</i>,
              })}
            </div>
          ) : (
            <div className="margin-top-xs">
              {intl.formatMessage(messages.createdBy, {
                name: event.member.name,
                link: chunks => <i>{chunks}</i>,
              })}
            </div>
          )}
        </>
      ) : null}

      {event.sourceAgendas?.length ? (
        <div className="margin-top-xs">
          {intl.formatMessage(messages.aggregatedFrom, {
            title: event.sourceAgendas[0].title,
            link: chunks => (
              <a href={`/${event.sourceAgendas[0].slug}`}>{chunks}</a>
            ),
          })}
        </div>
      ) : null}

      <div className="margin-top-xs">
        <ul className="list-inline">
          <li>
            <StateSelector
              agenda={agenda}
              event={event}
              pageIndex={pageIndex}
            />
          </li>

          {event.member && event.originAgenda?.uid === agenda.uid ? (
            <li>
              <a
                className="btn btn-link btn-link-inline"
                href={`/${agenda.slug}/events/${event.slug}/edit`}
              >
                {intl.formatMessage(messages.edit)}
              </a>
            </li>
          ) : null}

          <li>
            <a
              className="btn btn-link btn-link-inline"
              href={`/${agenda.slug}/events/${event.slug}/contact`}
            >
              {intl.formatMessage(messages.contact)}
            </a>
          </li>

          {event.member && event.originAgenda?.uid === agenda.uid ? (
            <li>
              <a
                className="btn btn-link btn-link-inline"
                href={`/${agenda.slug}/admin/locations?uids[]=${event.location.uid}`}
              >
                {intl.formatMessage(messages.showLocation)}
              </a>
            </li>
          ) : null}

          {event.member && event.originAgenda?.uid === agenda.uid ? (
            <li>
              <button
                type="button"
                className="btn btn-link btn-link-inline text-danger"
                onClick={openRemoveModal}
              >
                {intl.formatMessage(messages.delete)}
              </button>
            </li>
          ) : (
            <li>
              <button
                type="button"
                className="btn btn-link btn-link-inline text-danger"
                onClick={openRemoveModal}
              >
                {intl.formatMessage(messages.remove)}
              </button>
            </li>
          )}
        </ul>
      </div>
    </li>
  );
}
