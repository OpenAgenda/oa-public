import useSWR from 'swr';
import { useAgenda } from '../contexts/agenda';

export default function useMember() {
  const agenda = useAgenda();

  const {
    data,
    ...rest
  } = useSWR(`/api/me/agendas/${agenda.uid}?includes[]=me.member&includes[]=me.authorizations`);

  return {
    member: data?.me?.member,
    authorizations: data?.me?.authorizations,
    ...rest,
  };
}
