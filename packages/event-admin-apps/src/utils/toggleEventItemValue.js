export default function toggleEventItemValue({ queryClient, key, agendaSlug, eventSlug }) {
  return (_result, value) => {
    queryClient.setQueriesData({
      queryKey: ['event-admin-apps', 'events', agendaSlug],
    }, oldData => {
      const eventIndex = oldData.events.findIndex(
        v => v.slug === eventSlug,
      );

      if (eventIndex === -1) {
        return oldData;
      }

      const eventData = {
        ...oldData.events[eventIndex],
        [key]: value,
      };

      return {
        ...oldData,
        events: [
          ...oldData.events.slice(0, eventIndex),
          eventData,
          ...oldData.events.slice(eventIndex + 1),
        ],
      };
    });
  };
}
