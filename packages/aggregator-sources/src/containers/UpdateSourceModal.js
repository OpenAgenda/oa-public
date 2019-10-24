import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import Modal from '@openagenda/react-components/build/Modal';
import * as modalsActions from '../reducers/modals';

const messages = defineMessages({
  updateSource: {
    id: 'aggregator-sources.UpdateSourceModal.updateSource',
    defaultMessage: 'Update a source'
  }
});

export default function UpdateSourceModal() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const closeModal = useCallback(
    () => dispatch(modalsActions.closeModal('updateSource')),
    [dispatch]
  );

  return (
    <Modal
      title={intl.formatMessage(messages.updateSource)}
      onClose={closeModal}
    >
      Ok
    </Modal>
  );
}
