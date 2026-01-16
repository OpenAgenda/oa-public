import useSWR from 'swr';
import { useAgenda } from '../contexts/agenda';
import useEvent from './useEvent';

export default function useMember() {
  const agenda = useAgenda();
  const { event, status } = useEvent();

  const { data, ...rest } = useSWR(
    status !== 'FETCHING'
      ? `/api/me/agendas/${agenda.uid}/events/${event.uid}`
      : null,
  );

  return {
    me: data?.me,
    member: data?.member,
    ...rest,
  };
}
