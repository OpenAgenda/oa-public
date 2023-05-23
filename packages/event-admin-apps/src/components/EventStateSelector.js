import React, { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import toggleEventItemValue from '../utils/toggleEventItemValue';
import StateSelector from './StateSelector';

export default function EventStateSelector({ agenda, event }) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    value => apiClient.post(`/${agenda.slug}/events/${event.slug}/state`, {
      state: value,
    }),
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
    option => mutation.mutate(option.value),
    [mutation]
  );

  return (
    <StateSelector
      value={event.state}
      onChange={onChange}
      isDisabled={mutation.isLoading}
      isLoading={mutation.isLoading}
    />
  );
}
