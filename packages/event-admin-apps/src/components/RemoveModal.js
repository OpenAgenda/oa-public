import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  removeEvent: {
    id: 'EventAdminApp.RemoveModal.removeEvent',
    defaultMessage: 'Remove an event',
  },
  deleteEvent: {
    id: 'EventAdminApp.RemoveModal.deleteEvent',
    defaultMessage: 'Delete an event',
  },
  deleteDesc: {
    id: 'EventAdminApp.RemoveModal.deleteDesc',
    defaultMessage:
      'Are you sure you want to do this? If you delete the event from this agenda, it will be permanently removed from all agendas on OpenAgenda.',
  },
  removeDesc: {
    id: 'EventAdminApp.RemoveModal.removeDesc',
    defaultMessage:
      'Are you sure you want to do this? If you remove the event from this agenda, it will no longer be listed in the exports and will be removed from any agenda aggregating your events',
  },
  confirm: {
    id: 'EventAdminApp.RemoveModal.confirm',
    defaultMessage: 'Confirm',
  },
});

export default function RemoveModal({
  agenda, event, onRemove, onClose
}) {
  const intl = useIntl();

  const isDeletion = event.member && event.originAgenda?.uid === agenda.uid;

  return (
    <Modal
      title={intl.formatMessage(
        isDeletion ? messages.deleteEvent : messages.removeEvent
      )}
      onClose={onClose}
      // classNames={{
      //   overlay: 'popup-overlay big'
      // }}
      disableBodyScroll
    >
      <p className="text-center margin-top-sm">
        {intl.formatMessage(
          isDeletion ? messages.deleteDesc : messages.removeDesc
        )}
      </p>

      <div className="text-center margin-top-md">
        <button type="button" className="btn btn-primary" onClick={onRemove}>
          {intl.formatMessage(messages.confirm)}
        </button>
      </div>
    </Modal>
  );
}
