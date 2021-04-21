import React, { useCallback, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import qs from 'qs';
import { css } from '@emotion/react';
import { getLocaleValue, useApiClient } from '@openagenda/react-shared';
import { MoreInfo } from '@openagenda/react-components';
import addQueryPrefix from '../utils/addQueryPrefix';
import EventStateSelector from './EventStateSelector';

const messages = defineMessages({
  createdBy: {
    id: 'EventAdminApp.EventItem.createdBy',
    defaultMessage: 'Created by <link>{name}</link>',
  },
  addedBy: {
    id: 'EventAdminApp.EventItem.addedBy',
    defaultMessage: 'Added by <link>{name}</link>',
  },
  sharedFrom: {
    id: 'EventAdminApp.EventItem.sharedFrom',
    defaultMessage: 'Shared from <link>{title}</link>',
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
  onlineEvent: {
    id: 'EventAdminApp.EventItem.onlineEvent',
    defaultMessage: 'Online event',
  },
  showOnlineLocation: {
    id: 'EventAdminApp.EventItem.showOnlineLocation',
    defaultMessage: 'Access the online event',
  },
  removeFeatured: {
    id: 'EventAdminApp.EventItem.removeFeatured',
    defaultMessage: 'Remove from featured',
  },
  addFeatured: {
    id: 'EventAdminApp.EventItem.addFeatured',
    defaultMessage: 'Add to featured',
  },
  featured: {
    id: 'EventAdminApp.EventItem.featured',
    defaultMessage: 'Featured',
  },
});

export default function EventItem({
  agenda,
  event,
  openRemoveModal,
  selected,
  selectEvent,
  selectionMode,
  query,
  page,
  index,
  isFirst,
  isLast,
}) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
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

  const hasOfflineLocation = event.attendanceMode === 1 || event.attendanceMode === 3;
  const hasOnlineLocation = event.attendanceMode === 2 || event.attendanceMode === 3;

  const [hovered, setHovered] = useState(false);

  const onSelect = useCallback(() => selectEvent(event.uid), [
    event.uid,
    selectEvent,
  ]);

  const mutation = useMutation(
    value => apiClient.patch(`/api/agendas/${agenda.uid}/events/${event.uid}`, {
      featured: value,
    }),
    {
      onSuccess: (result, value) => {
        const eventsQuery = queryClient
          .getQueryCache()
          .find(['event-admin-apps', 'events', agenda.slug]);

        const queryData = eventsQuery.state.data;
        const eventIndex = queryData.events.findIndex(
          v => v.slug === event.slug
        );

        const eventData = {
          ...queryData.events[eventIndex],
          featured: value,
        };

        queryClient.setQueryData(eventsQuery.queryKey, {
          ...queryData,
          events: [
            ...queryData.events.slice(0, eventIndex),
            eventData,
            ...queryData.events.slice(eventIndex + 1),
          ],
        });
      },
    }
  );

  const removeFeatured = useCallback(() => mutation.mutate(false), [mutation]);
  const addFeatured = useCallback(() => mutation.mutate(true), [mutation]);

  const onMouseEnter = useCallback(
    () => setTimeout(() => setHovered(true)),
    []
  );
  const onMouseLeave = useCallback(
    () => setTimeout(() => setHovered(false)),
    []
  );

  const adminNavStr = useMemo(
    () => qs.stringify(
      {
        admin_nav: {
          ...addQueryPrefix(query),
          page: page > 1 ? page : null,
          index,
          first: isFirst || null,
          last: isLast || null,
        },
      },
      {
        addQueryPrefix: true,
        arrayFormat: 'brackets',
        skipNulls: true,
      }
    ),
    [index, isFirst, isLast, page, query]
  );

  return (
    <li
      key={event.uid}
      className="padding-v-sm padding-right-md"
      css={css`
        position: relative;
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <a
          href={`/${agenda.slug}/events/${event.slug}${adminNavStr}`}
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

      {/* Location */}

      {hasOfflineLocation ? (
        <div className="margin-top-xs">
          {event.location.name}, {getLocaleValue(event.dateRange, intl.locale)}
        </div>
      ) : null}

      {event.attendanceMode === 2 ? (
        <div className="margin-top-xs">
          {intl.formatMessage(messages.onlineEvent)},{' '}
          {getLocaleValue(event.dateRange, intl.locale)}
        </div>
      ) : null}

      {/* Add method */}

      {event.addMethod === 'contribution' && event.member?.name ? (
        <div className="margin-top-xs">
          {intl.formatMessage(messages.createdBy, {
            name: event.member.name,
            link: chunks => <i>{chunks}</i>,
          })}
        </div>
      ) : null}

      {event.addMethod === 'share' ? (
        <div className="margin-top-xs">
          {intl.formatMessage(messages.sharedFrom, {
            title: event.originAgenda.title,
            link: chunks => (
              <a href={`/agendas/${event.originAgenda.uid}`}>{chunks}</a>
            ),
          })}
        </div>
      ) : null}

      {event.addMethod === 'aggregation' && event.sourceAgendas?.length ? (
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
            <EventStateSelector agenda={agenda} event={event} />
          </li>

          <li>
            {event.featured ? (
              <MoreInfo
                id={`featured-${event.uid}`}
                content={intl.formatMessage(messages.removeFeatured)}
                placement="bottom"
              >
                <button
                  type="button"
                  className="btn btn-link btn-link-inline"
                  onClick={removeFeatured}
                >
                  {intl.formatMessage(messages.featured)}
                </button>
              </MoreInfo>
            ) : (
              <button
                type="button"
                className="btn btn-link btn-link-inline"
                onClick={addFeatured}
              >
                {intl.formatMessage(messages.addFeatured)}
              </button>
            )}
          </li>

          <li>
            <a
              className="btn btn-link btn-link-inline"
              href={`/${agenda.slug}/contribute/event/${event.uid}`}
            >
              {intl.formatMessage(messages.edit)}
            </a>
          </li>

          <li>
            <a
              className="btn btn-link btn-link-inline"
              href={`/${agenda.slug}/events/${event.slug}/contact`}
            >
              {intl.formatMessage(messages.contact)}
            </a>
          </li>

          {event.member
          && event.originAgenda?.uid === agenda.uid
          && hasOfflineLocation ? (
            <li>
              <a
                className="btn btn-link btn-link-inline"
                href={`/${agenda.slug}/admin/locations?uids[]=${event.location.uid}`}
              >
                {intl.formatMessage(messages.showLocation)}
              </a>
            </li>
            ) : null}

          {hasOnlineLocation ? (
            <li>
              <a
                className="btn btn-link btn-link-inline"
                target="_blank"
                rel="noopener noreferrer"
                href={event.onlineAccessLink}
              >
                {intl.formatMessage(messages.showOnlineLocation)}
                &nbsp;
                <i className="fa fa-external-link" />
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

        {hovered || selectionMode ? (
          <div
            css={css`
              position: absolute;
              top: 50%;
              right: 4px;
              transform: translateY(-50%);
            `}
          >
            <input type="checkbox" onChange={onSelect} checked={selected} />
          </div>
        ) : null}
      </div>
    </li>
  );
}
