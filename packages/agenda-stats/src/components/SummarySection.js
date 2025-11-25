import { FormattedMessage } from 'react-intl';
import { useQuery } from 'react-query';
import { useApiClient, Spinner } from '@openagenda/react-shared';

export default function SummarySection({ agendaUid }) {
  const apiClient = useApiClient();

  const { data, error, isLoading } = useQuery(
    ['agenda-stats', 'summary', agendaUid],
    () =>
      apiClient
        .get(`/api/agendas/${agendaUid}/summary`, {
          searchParams: {
            includes: ['publishedEvents'],
          },
        })
        .json(),
    {
      staleTime: 1000,
      notifyOnChangeProps: ['data', 'error'],
    },
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="info-block margin-bottom-md">
        <div className="text-center">
          <FormattedMessage
            id="AgendaStats.SummarySection.loading"
            defaultMessage="Summary section loading"
          />
          <span className="margin-left-xs">
            <Spinner mode="inline" />
          </span>
        </div>
      </div>
    );
  }

  // Gracefully handle errors or missing data
  if (error || !data?.summary?.publishedEvents) {
    return null;
  }

  const {
    summary: { publishedEvents },
  } = data;

  return (
    <div className="info-block margin-bottom-md">
      <div className="text-left">
        <div style={{ fontWeight: 'normal' }}>
          <FormattedMessage
            id="AgendaStats.SummarySection.totalPublishedEvents"
            defaultMessage="<strong>{eventCount, number}</strong> events published in <strong>{locationCount, number}</strong> locations by <strong>{creatorCount, number}</strong> contributors"
            values={{
              eventCount: publishedEvents.events,
              locationCount: publishedEvents.eventLocations,
              creatorCount: publishedEvents.eventCreators,
              strong: (chunks) => <strong>{chunks}</strong>,
            }}
          />
        </div>
        <br />
        <em className="margin-top-sm">
          <FormattedMessage
            id="AgendaStats.SummarySection.totalPublishedEventsInfo"
            defaultMessage="To note: Events added by aggregation or sharing can be linked to contributors and locations referenced on other calendars"
          />
        </em>
      </div>
    </div>
  );
}
