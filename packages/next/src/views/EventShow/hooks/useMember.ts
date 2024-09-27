import useSWR from 'swr';
import { useAgenda } from '../contexts/agenda';
import useEvent from './useEvent';

export default function useMember() {
  const agenda = useAgenda();
  const { event } = useEvent();

  const { data, ...rest } = useSWR(
    `/api/me/agendas/${agenda.uid}/events/${event.uid}`,
  ); // ?includes[]=me.member&includes[]=me.authorizations

  return {
    me: data?.me,
    member: data?.member,
    ...rest,
  };
}
