import { useQuery } from 'react-query';
import axios from 'axios';

import useRes from './useRes';

export default agenda => {
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery('agenda-memberSchema', () =>
    axios.get(res.getSettings, { params: {} }).then(response => response.data));
  console.log('useSettings', data);
  return {
    isLoading,
    error,
    schema: data,
  };
};
