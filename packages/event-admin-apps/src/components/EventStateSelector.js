import React, { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import StateSelector from './StateSelector';

export default function EventStateSelector({ agenda, event, pageIndex }) {
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
          .find(['event-admin-apps', 'events']);

        const queryData = query.state.data;
        const pageData = queryData.pages[pageIndex];
        const eventIndex = pageData.events.findIndex(
          v => v.slug === event.slug
        );

        const eventData = {
          ...pageData.events[eventIndex],
          state: value,
        };

        queryClient.setQueryData(query.queryKey, {
          ...queryData,
          pages: [
            ...queryData.pages.slice(0, pageIndex),
            {
              ...pageData,
              events: [
                ...pageData.events.slice(0, eventIndex),
                eventData,
                ...pageData.events.slice(eventIndex + 1),
              ],
            },
            ...queryData.pages.slice(pageIndex + 1),
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
