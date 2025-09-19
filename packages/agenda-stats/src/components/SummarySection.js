import { FormattedMessage } from 'react-intl';
import { useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';

export default function SummarySection({ agendaUid }) {
  const apiClient = useApiClient();

  const { data, error } = useQuery(
    ['agenda-stats', 'summary', agendaUid],
    () =>
      apiClient.get(`/api/agendas/${agendaUid}/summary`, {
        params: {
          includes: ['publishedEvents'],
        },
      }),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'error'],
    },
  );

  // Gracefully handle errors or missing data
  if (error || !data?.data?.summary?.publishedEvents) {
    return null;
  }

  const {
    summary: { publishedEvents },
  } = data.data;

  return (
    <div className="info-block margin-bottom-md">
      <div className="text-center">
        <FormattedMessage
          id="AgendaStats.SummarySection.totalPublishedEvents"
          defaultMessage="{eventCount, number} events published in {locationCount, number} locations by {creatorCount} contributors"
          values={{
            eventCount: publishedEvents.events,
            locationCount: publishedEvents.eventLocations,
            creatorCount: publishedEvents.eventCreators,
          }}
        />
        <br />
        <FormattedMessage
          id="AgendaStats.SummarySection.totalPublishedEventsInfo"
          defaultMessage="Events added by aggregation or sharing can be linked to contributors and locations referenced on other calendars"
        />
      </div>
    </div>
  );
}
