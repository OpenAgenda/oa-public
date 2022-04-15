import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import qs from 'qs';
import { css } from '@emotion/react';
import { useApiClient, MoreInfo } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import addQueryPrefix from '../utils/addQueryPrefix';
import EventStateSelector from './EventStateSelector';
import EventItemShareLine from './EventItemShareLine';

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
  memberPlaceholder: {
    id: 'EventAdminApp.EventItem.memberPlaceholder',
    defaultMessage: 'a {role} member',
  },
  noRoleMemberPlaceholder: {
    id: 'EventAdminApp.EventItem.noRoleMemberPlaceholder',
    defaultMessage: 'a member',
  },
  contributor: {
    id: 'EventAdminApp.EventItem.contributor',
    defaultMessage: 'contributor',
  },
  moderator: {
    id: 'EventAdminApp.EventItem.moderator',
    defaultMessage: 'moderator',
  },
  administrator: {
    id: 'EventAdminApp.EventItem.administrator',
    defaultMessage: 'administrator',
  },
  unnamedMemberInfo: {
    id: 'EventAdminApp.EventItem.unnamedMemberInfo',
    defaultMessage: 'Member has not specified his/her name',
  },
  statusRescheduledInfo: {
    id: 'EventAdminApp.EventItem.statusRescheduledInfo',
    defaultMessage: 'The timings and dates of the event have been modified',
  },
  statusRescheduled: {
    id: 'EventAdminApp.EventItem.statusRescheduled',
    defaultMessage: 'Rescheduled',
  },
  statusMovedOnlineInfo: {
    id: 'EventAdminApp.EventItem.statusMovedOnlineInfo',
    defaultMessage:
      'The event will no longer be attended to at a physical location',
  },
  statusMovedOnline: {
    id: 'EventAdminApp.EventItem.statusMovedOnline',
    defaultMessage: 'Moved online',
  },
  statusPostponedInfo: {
    id: 'EventAdminApp.EventItem.statusPostponedInfo',
    defaultMessage:
      'The event dates are no longer valid. New dates are not yet known',
  },
  statusPostponed: {
    id: 'EventAdminApp.EventItem.statusPostponed',
    defaultMessage: 'Postponed',
  },
  statusFullInfo: {
    id: 'EventAdminApp.EventItem.statusFullInfo',
    defaultMessage: 'New participants are no longer accepted to the event',
  },
  statusFull: {
    id: 'EventAdminApp.EventItem.statusFull',
    defaultMessage: 'Fully booked',
  },
  statusCancelledInfo: {
    id: 'EventAdminApp.EventItem.statusCancelledInfo',
    defaultMessage: 'The event has been permanently cancelled',
  },
  statusCancelled: {
    id: 'EventAdminApp.EventItem.statusCancelled',
    defaultMessage: 'Cancelled',
  },
});

function StatusBadge({ status }) {
  const intl = useIntl();
  let elem;

  switch (status) {
    case 2:
      elem = (
        <span
          title={intl.formatMessage(messages.statusRescheduledInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(messages.statusRescheduled)}
        </span>
      );
      break;
    case 3:
      elem = (
        <span
          title={intl.formatMessage(messages.statusMovedOnlineInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(messages.statusMovedOnline)}
        </span>
      );
      break;
    case 4:
      elem = (
        <span
          title={intl.formatMessage(messages.statusPostponedInfo)}
          className="label label-warning"
        >
          {intl.formatMessage(messages.statusPostponed)}
        </span>
      );
      break;
    case 5:
      elem = (
        <span
          title={intl.formatMessage(messages.statusFullInfo)}
          className="label label-danger"
        >
          {intl.formatMessage(messages.statusFull)}
        </span>
      );
      break;
    case 6:
      elem = (
        <span
          title={intl.formatMessage(messages.statusCancelledInfo)}
          className="label label-danger"
        >
          {intl.formatMessage(messages.statusCancelled)}
        </span>
      );
      break;
    default:
      return null;
  }

  return <span className="padding-right-sm status">{elem}</span>;
}

export default function EventItem({
  redirectURL,
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

  const [hovered, setHovered] = useState(false);

  const onSelect = useCallback(
    () => selectEvent(event.uid),
    [event.uid, selectEvent]
  );

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

  const memberPlaceholderMsg = member => event.member?.name ?? (
  <span title={intl.formatMessage(messages.unnamedMemberInfo)}>
    {member?.role
      ? intl.formatMessage(messages.memberPlaceholder, {
        role: intl.formatMessage(
          messages[
            ['contributor', 'administrator', 'moderator'][member.role - 1]
          ]
        ),
      })
      : intl.formatMessage(messages.noRoleMemberPlaceholder)}
  </span>
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
          <StatusBadge status={event.status} />

          <b>{getLocaleValue(event.title, intl.locale)}</b>

          {isPassed ? (
            <span className="badge badge-default margin-left-xs">
              {intl.formatMessage(messages.passed)}
            </span>
          ) : null}
        </a>
      </div>

      {/* Location */}

      {event.location ? (
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

      {event.addMethod === 'contribution' && event.member ? (
        <div className="margin-top-xs">
          {intl.formatMessage(messages.createdBy, {
            name: memberPlaceholderMsg(event.member),
            link: chunks => (event.member ? (
              <a
                href={`/${agenda.slug}/admin/members?userUid=${event.member.uid}`}
              >
                {chunks}
              </a>
            ) : (
              <i>{chunks}</i>
            )),
          })}
        </div>
      ) : null}

      {event.addMethod === 'share' ? (
        <div className="margin-top-xs">
          <EventItemShareLine
            event={event}
            agenda={agenda}
            memberPlaceholderMsg={memberPlaceholderMsg}
          />
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
            <Link
              to={`/${agenda.slug}/contribute/event/${event.uid}?redirect=${redirectURL}`}
              className="btn btn-link btn-link-inline"
            >
              {intl.formatMessage(messages.edit)}
            </Link>
          </li>

          <li>
            <a
              className="btn btn-link btn-link-inline"
              href={`/${agenda.slug}/admin/events/${event.slug}/contact`}
            >
              {intl.formatMessage(messages.contact)}
            </a>
          </li>

          {event.member
          && event.originAgenda?.uid === agenda.uid
          && event.location ? (
            <li>
              <a
                className="btn btn-link btn-link-inline"
                href={`/${agenda.slug}/admin/locations/${event.location.uid}?uids[]=${event.location.uid}`}
              >
                {intl.formatMessage(messages.showLocation)}
              </a>
            </li>
            ) : null}

          {event.onlineAccessLink ? (
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
