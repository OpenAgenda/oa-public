import { useQuery } from 'react-query';
import axios from 'axios';

import useRes from './useRes';

export default agenda => {
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery('locations-settings', () => (
    axios.get(res.getSettings, {}).then(response => response.data)
  ));
  return {
    isLoading,
    error,
    settings: data,
  };
};
