import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

const messages = defineMessages({
  noEvents: {
    id: 'EventAdminApp.EmptyDashboard.noEvents',
    defaultMessage: 'Your agenda does not yet reference any event!',
  },
  createFirstEvent: {
    id: 'EventAdminApp.EmptyDashboard.createFirstEvent',
    defaultMessage: 'Create a first event',
  },
  alternatively: {
    id: 'EventAdminApp.EmptyDashboard.alternatively',
    defaultMessage: 'Alternatively, you can:',
  },
  inviteMembers: {
    id: 'EventAdminApp.EmptyDashboard.inviteMembers',
    defaultMessage: 'Invite people to <link>contribute</link>',
  },
  addSources: {
    id: 'EventAdminApp.EmptyDashboard.addSources',
    defaultMessage:
      'Aggregate events published on other agendas by <link>adding them to sources</link>',
  },
  visitDoc: {
    id: 'EventAdminApp.EmptyDashboard.visitDoc',
    defaultMessage: 'Visit <link>our documentation</link> to find out more.',
  },
});

export default function EmptyDashboard({ agenda }) {
  const intl = useIntl();

  return (
    <div>
      <div className="text-center margin-v-lg">
        <b>{intl.formatMessage(messages.noEvents)}</b>

        <div className="margin-top-lg">
          <Link to={`/${agenda.slug}/contribute`} className="btn btn-primary">
            {intl.formatMessage(messages.createFirstEvent)}
          </Link>
        </div>
      </div>

      <div>
        {intl.formatMessage(messages.alternatively)}

        <ul className="margin-v-md">
          <li className="margin-v-xs">
            {intl.formatMessage(messages.inviteMembers, {
              link: chunks => (
                <Link to={`/${agenda.slug}/admin/members`}>{chunks}</Link>
              ),
            })}
          </li>
          <li className="margin-v-xs">
            {intl.formatMessage(messages.addSources, {
              link: chunks => (
                <Link to={`/${agenda.slug}/admin/sources`}>{chunks}</Link>
              ),
            })}
          </li>
        </ul>

        {intl.formatMessage(messages.visitDoc, {
          link: chunks => (
            <a
              href="https://doc.openagenda.com/ajouter-des-evenements-a-un-agenda/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
        })}
      </div>
    </div>
  );
}
