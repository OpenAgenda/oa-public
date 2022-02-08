import React from 'react';
import { MoreInfo } from '@openagenda/react-shared';
import { defineMessages, useIntl } from 'react-intl';

import utils from '../lib/utils';

const {
  hasAdditionalFields
} = utils;

const messages = defineMessages({
  noEditionRights: {
    id: 'AgendaContribute.RequestEditionRights.noEditionRights',
    defaultMessage: 'You do not have edition rights on this event.'
  },
  onlyAdditionalFieldsCanBeEdited: {
    id: 'AgendaContribute.RequestEditionRights.onlyAdditionalFieldsCanBeEdited',
    defaultMessage: 'Only additional fields of the agenda can be edited here.'
  },
  onlyAdditionalFieldsCanBeEditedInfo: {
    id: 'AgendaContribute.RequestEditionRights.onlyAdditionalFieldsCanBeEditedInfo',
    defaultMessage: 'This event was added to the agenda "%agenda%" through a share or by aggregation. Only membres of the agenda where the event was contributed can change its content.'
  },
  requestEditionRights: {
    id: 'AgendaContribute.RequestEditionRights.requestEditionRights',
    defaultMessage: 'Request edition rights'
  },
  requestEditionRightsInfo: {
    id: 'AgendaContribute.RequestEditionRights.requestEditionRightsInfo',
    defaultMessage: 'This event comes from another agenda. Edition rights are required to change its main fields (ex: title, description, timings...)'
  }
});

function RequestEditionRights({
  agenda,
  event,
  schema
}) {
  const m = useIntl().formatMessage;

  return (
    <div className="margin-h-md padding-top-md">
      <p>
        <span>{m(messages.noEditionRights)} </span> {hasAdditionalFields(schema) ? <span>{m(messages.onlyAdditionalFieldsCanBeEdited)}</span> : null}
        <span>
          <MoreInfo
            id="noEditionRights"
            content={m(messages.onlyAdditionalFieldsCanBeEditedInfo, { agenda: agenda.title })}
          />
        </span>
      </p>
      <p>
        <a
          className="margin-right-xs"
          href={`/${agenda.slug}/admin/events/${event.slug}/edition-request`}
        >
          {m(messages.requestEditionRights)}
        </a>
        <MoreInfo
          id="requestEditionRights"
          content={m(messages.requestEditionRightsInfo)}
        />
      </p>
    </div>
  );
}

export default RequestEditionRights;
