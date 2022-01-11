import React from 'react';
import { MoreInfo } from '@openagenda/react-shared';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  additionalFieldsShowInfo: {
    id: 'AgendaContribute.ShowFullEventForm.additionalFieldsShowInfo',
    defaultMessage: 'Only additional fields of the agenda are currently shown'
  },
  showEventFields: {
    id: 'AgendaContribute.ShowFullEventForm.showEventFields',
    defaultMessage: 'Edit event fields'
  },
  showEventFieldsInfo: {
    id: 'AgendaContribute.ShowFullEventForm.showEventFieldsInfo',
    defaultMessage: 'You have edition rights over the event. Any edition brought to its standard fields (title, description, timings) will be visible anywhere it is published.'
  }
});

export default function ShowFullEventForm({
  onShowFullEvent
}) {
  const m = useIntl().formatMessage;

  return (
    <div className="wsq">
      <div className="event-instruction boxed padding-all-md padding-bottom-sm margin-bottom-md">
        <div>{m(messages.additionalFieldsShowInfo)}</div>
        <button
          type="button"
          className="btn btn-link margin-h-z padding-h-z"
          onClick={() => onShowFullEvent()}
        >
          {m(messages.showEventFields)}
        </button>
        <MoreInfo
          id="show-full-event-in-share-info"
          className="margin-h-xs"
          content={m(messages.showEventFieldsInfo)}
        />
      </div>
    </div>
  );
}
