import axios from 'axios';
import { useQuery } from 'react-query';

export default function useMember(res) {
  const {
    isLoading: memberIsLoading,
    data: member
  } = useQuery('member', () => axios.get(res.member).then(response => (response.data)));

  return {
    memberIsLoading,
    member
  };
}
