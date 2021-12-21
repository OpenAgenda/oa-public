import React, { useCallback } from 'react';
import { useMutation } from 'react-query';
import { defineMessages, useIntl } from 'react-intl';
import { useApiClient, useModal, Modal } from '@openagenda/react-shared';
import StateSelector from './StateSelector';

const messages = defineMessages({
  ok: {
    id: 'EventAdminApp.BatchedStateSelector.ok',
    defaultMessage: 'Ok',
  },
  confirmation: {
    id: 'EventAdminApp.BatchedStateSelector.confirmation',
    defaultMessage: 'The state change is in progress and may take some time.',
  },
  title: {
    id: 'EventAdminApp.BatchedStateSelector.title',
    defaultMessage: 'Confirmation',
  },
});

export default function BatchedStateSelector({
  agenda,
  queryString,
  ...otherProps
}) {
  const intl = useIntl();
  const apiClient = useApiClient();

  const confirmationModal = useModal();

  const mutation = useMutation(
    variables => apiClient.patch(`/${agenda.slug}/admin/events/batch${queryString}`, {
      state: variables.state,
    }),
    {
      onSuccess: (/* result, value */) => {
        confirmationModal.open();
      },
    }
  );

  const onChange = useCallback(
    option => mutation.mutate({
      state: option.value,
    }),
    [mutation]
  );

  return (
    <>
      <StateSelector
        // value={lastChange}
        onChange={onChange}
        isDisabled={mutation.isLoading}
        isLoading={mutation.isLoading}
        {...otherProps}
      />

      {confirmationModal.isOpen ? (
        <Modal
          title={intl.formatMessage(messages.title)}
          onClose={confirmationModal.close}
        >
          {intl.formatMessage(messages.confirmation)}

          <div className="margin-top-sm text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmationModal.close}
            >
              {intl.formatMessage(messages.ok)}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
