import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useMember() {
  const res = useSelector(state => state.res);

  const {
    isLoading: memberIsLoading,
    data: member
  } = useQuery('member', () => axios.get(res.member).then(response => (response.data)));

  return {
    memberIsLoading,
    member
  };
}
