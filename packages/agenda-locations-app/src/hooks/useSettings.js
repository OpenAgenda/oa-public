import { useQuery } from 'react-query';

import useRes from './useRes.js';

export default (agenda) => {
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery('locations-settings', () =>
    fetch(
      `${res.getSettings}${res.getSettings.includes('?') ? '&' : '?'}includeSetInfo=true`,
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Invalid status (${response.status})`);
      }
      return response.json();
    }));
  return {
    isLoading,
    error,
    settings: data,
  };
};
