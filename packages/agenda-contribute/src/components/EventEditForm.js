import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import EventForm from '@openagenda/event-form/build';
import ButtonSpinner from './ButtonSpinner';

const messages = defineMessages({
  update: {
    id: 'AgendaContribute.EventEdit.update',
    defaultMessage: 'Update'
  }
});

function EventEditForm({
  config,
  event,
  onSuccess,
  memberRole,
  saveButtonLabel,
  res
}) {
  const m = useIntl().formatMessage;

  return (
    <EventForm
      {...config}
      res={res}
      role={memberRole}
      values={event}
      onSubmitSuccess={onSuccess}
      actionComponents={[{
        position: 'bottom',
        Component: ({ onSubmit, loading }) => (
          <div className="wsq padding-all-md">
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={loading}
              onClick={onSubmit}
            >
              {saveButtonLabel || m(messages.update)}
            </button>
            {loading && <ButtonSpinner />}
          </div>
        )
      }]}
    />
  );
}

export default EventEditForm;
