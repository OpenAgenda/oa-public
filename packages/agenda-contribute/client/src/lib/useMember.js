import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useMember(agenda) {
  const res = useSelector(state => state.APIRoot + state.res.member.replace(':agendaUid', agenda.uid));

  const {
    isLoading: memberIsLoading,
    data: member
  } = useQuery('member', () => axios.get(res).then(response => (response.data)));

  return {
    memberIsLoading,
    member
  };
}
