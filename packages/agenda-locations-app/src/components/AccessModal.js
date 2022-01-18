import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Modal } from '@openagenda/react-shared';

const messages = defineMessages({
  info: {
    id: 'AgendaLocations.AccessModal.info',
    defaultMessage: 'Information',
  },
  cantDo: {
    id: 'AgendaLocations.AccessModal.cantDo',
    defaultMessage: 'You do not have the rights for:',
  },
  closeModal: {
    id: 'AgendaLocations.AccessModal.closeModal',
    defaultMessage: 'Close',
  },
  edit: {
    id: 'AgendaLocations.AccessModal.edit',
    defaultMessage: 'Edit',
  },
  create: {
    id: 'AgendaLocations.AccessModal.create',
    defaultMessage: 'Add a location',
  },
  remove: {
    id: 'AgendaLocations.AccessModal.remove',
    defaultMessage: 'Delete',
  },
  merge: {
    id: 'AgendaLocations.AccessModal.merge',
    defaultMessage: 'Merge locations',
  },
});

const AccessModal = ({
  action,
  close
}) => {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.info)}
      onClose={close}
    >
      <div>
        <p className="text-center">
          {`${intl.formatMessage(messages.cantDo)} ${intl.formatMessage(messages[action])}`}
        </p>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary margin-top-sm"
            onClick={close}
          >
            <FormattedMessage {...messages.closeModal} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AccessModal;
