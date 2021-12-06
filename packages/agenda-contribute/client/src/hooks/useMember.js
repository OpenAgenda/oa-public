import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useMember(agenda) {
  const res = useSelector(state => state.settings.apiRoot + state.res.member.replace(':agendaUid', agenda.uid));
  const memberFreshness = useSelector(state => state.memberFreshness);

  const {
    isLoading: memberIsLoading,
    data: member
  } = useQuery('member', () => axios.get(res).then(response => (response.data)));

  if (memberIsLoading) {
    return {
      memberIsLoading
    };
  }

  const memberIsFresh = new Date(member?.updatedAt) > new Date(memberFreshness);

  return {
    memberIsLoading,
    memberIsFresh,
    member
  };
}
