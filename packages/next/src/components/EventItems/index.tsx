import useSWRImmutable from 'swr/immutable';
import { Spinner, VStack } from '@openagenda/uikit';
import qs from 'qs';
import { useIntl } from 'react-intl';
import { FetchStatus } from 'config/types';

import EventItem from './EventItem';
import messages from './messages';

export default function EventItems({ agenda, field, py }) {
  const intl = useIntl();

  const { data = {}, status } = useSWRImmutable(
    [].concat(field.value ?? []).length
      ? `/api/agendas/${agenda.uid}/events?${qs.stringify({ uid: field.value, state: [0, 1, 2] })}`
      : null,
  );

  if (status === FetchStatus.Fetching) {
    return <Spinner />;
  }

  const { events = [] } = data;

  return (
    <VStack gap="4" py={py} align="start">
      {!events.length ? (
        <div>{intl.formatMessage(messages.emptySelection)}</div>
      ) : null}
      {events.map((event) => (
        <EventItem
          agenda={agenda}
          key={`event-item-${event.uid}`}
          event={event}
        />
      ))}
    </VStack>
  );
}
