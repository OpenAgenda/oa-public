import React, { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import StateSelector from './StateSelector';

export default function EventStateSelector({ agenda, event }) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    value => apiClient.post(`/${agenda.slug}/events/${event.slug}/state`, {
      state: value,
    }),
    {
      onSuccess: (result, value) => {
        const query = queryClient
          .getQueryCache()
          .findAll(['event-admin-apps', 'events', agenda.slug])[0];

        const queryData = query.state.data;
        const eventIndex = queryData.events.findIndex(
          v => v.slug === event.slug
        );

        const eventData = {
          ...queryData.events[eventIndex],
          state: value,
        };

        queryClient.setQueryData(query.queryKey, {
          ...queryData,
          events: [
            ...queryData.events.slice(0, eventIndex),
            eventData,
            ...queryData.events.slice(eventIndex + 1),
          ],
        });
      },
    }
  );

  const onChange = useCallback(option => mutation.mutate(option.value), [
    mutation,
  ]);

  return (
    <StateSelector
      value={event.state}
      onChange={onChange}
      isDisabled={mutation.isLoading}
      isLoading={mutation.isLoading}
    />
  );
}
