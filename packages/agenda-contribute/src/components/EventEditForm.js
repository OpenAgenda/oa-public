import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Modal } from '@openagenda/react-shared';
import EventForm from '@openagenda/event-form';
import ButtonSpinner from './ButtonSpinner.js';

const messages = defineMessages({
  update: {
    id: 'AgendaContribute.EventEdit.update',
    defaultMessage: 'Update',
  },
  unpublishWarning: {
    id: 'AgendaContribute.EventEdit.unpublishWarning',
    defaultMessage:
      'Carefull updating this event will unpublish it for moderators to review',
  },
  unpublishWarningTitle: {
    id: 'AgendaContribute.EventEdit.unpublishWarningTitle',
    defaultMessage: 'Unpublish Warning',
  },
});

function EventEditForm({
  config,
  event,
  onSuccess,
  memberRole,
  saveButtonLabel,
  res,
  useSubmitModal = false,
}) {
  const m = useIntl().formatMessage;
  const [showModal, setShowModal] = useState(false);

  return (
    <EventForm
      {...config}
      res={res}
      role={memberRole}
      values={event}
      onSubmitSuccess={onSuccess}
      actionComponents={[
        {
          position: 'bottom',
          Component: ({ onSubmit, loading }) => (
            <>
              {showModal ? (
                <Modal
                  title={m(messages.unpublishWarningTitle)}
                  onClose={() => setShowModal(false)}
                >
                  <div className="margin-bottom-md">
                    {m(messages.unpublishWarning)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    onClick={onSubmit}
                  >
                    {saveButtonLabel || m(messages.update)}
                  </button>
                </Modal>
              ) : null}
              <div className="wsq padding-all-md">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                  onClick={useSubmitModal ? () => setShowModal(true) : onSubmit}
                >
                  {saveButtonLabel || m(messages.update)}
                </button>
                {loading && <ButtonSpinner />}
              </div>
            </>
          ),
        },
      ]}
    />
  );
}

export default EventEditForm;
