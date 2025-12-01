import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useApiClient, useModal, Modal } from '@openagenda/react-shared';
import { defineMessages, useIntl } from 'react-intl';
import toggleEventItemValue from '../utils/toggleEventItemValue.js';
import StateSelector from './StateSelector.js';

const messages = defineMessages({
  motive: {
    id: 'EventAdminApp.EventStateSelector.motive',
    defaultMessage: 'Motive',
  },
  motiveTitle: {
    id: 'EventAdminApp.EventStateSelector.motiveTitle',
    defaultMessage: 'Confirm Rejection',
  },
  motivePlaceholder: {
    id: 'EventAdminApp.EventStateSelector.motivePlaceholder',
    defaultMessage: 'Motive of rejection',
  },
  motiveInfo: {
    id: 'EventAdminApp.EventStateSelector.motiveInfo',
    defaultMessage:
      'The motive will be presented to the contributor in the notification sent to him by email as well as directly associated with the status on the event page.',
  },
  motiveConfirm: {
    id: 'EventAdminApp.EventStateSelector.motiveConfirm',
    defaultMessage: 'Confirm',
  },
});

export default function EventStateSelector({
  agenda,
  event,
  isEventValid = true,
}) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const rejectionModal = useModal();
  const [motive, setMotive] = useState(null);
  const intl = useIntl();

  const mutation = useMutation(
    (value) =>
      apiClient
        .post(`/${agenda.slug}/events/${event.slug}/state`, {
          json: {
            state: value,
            motive: value === -1 ? motive : null,
          },
        })
        .json(),
    {
      onSuccess: toggleEventItemValue({
        queryClient,
        key: 'state',
        agendaSlug: agenda.slug,
        eventSlug: event.slug,
      }),
    },
  );

  const onChange = useCallback(
    (option) => {
      if (option.value === -1) return rejectionModal.open();
      if (option.value === 2 && !isEventValid) {
        // Prevent publishing invalid events
        return;
      }
      return mutation.mutate(option.value);
    },
    [mutation, rejectionModal, isEventValid],
  );

  return (
    <>
      <StateSelector
        value={event.state}
        onChange={onChange}
        isEventValid={isEventValid}
        isDisabled={mutation.isLoading}
        isLoading={mutation.isLoading}
      />
      {rejectionModal.isOpen ? (
        <Modal
          title={intl.formatMessage(messages.motiveTitle)}
          onClose={rejectionModal.close}
        >
          <div>
            <b>{intl.formatMessage(messages.motive)}</b>
          </div>
          <div className="padding-bottom-xs">
            {intl.formatMessage(messages.motiveInfo)}{' '}
          </div>
          <textarea
            className="form-control"
            rows={6}
            value={motive}
            onChange={(v) => setMotive(v.target.value)}
            placeholder={intl.formatMessage(messages.motivePlaceholder)}
          />
          <div className="margin-top-sm text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                rejectionModal.close();
                return mutation.mutate(-1, motive);
              }}
            >
              {intl.formatMessage(messages.motiveConfirm)}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
