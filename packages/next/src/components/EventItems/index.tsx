import useSWRImmutable from 'swr/immutable';
import {
  Spinner,
  VStack,
} from '@openagenda/uikit';
import qs from 'qs';
import { FetchStatus } from 'config/types';

import EventItem from './EventItem';

export default function EventItems({ agenda, field }) {
  const {
    data,
    status,
  } = useSWRImmutable(`/api/agendas/${agenda.uid}/events?${qs.stringify({ uid: field.value })}`);

  if (status === FetchStatus.Fetching) {
    return <Spinner />;
  }

  const {
    events,
  } = data;

  return (
    <VStack spacing="4" align="start">
      {events.map(event => (<EventItem agenda={agenda} key={`${field.field}-${event.uid}`} event={event} />))}
    </VStack>
  );
}
