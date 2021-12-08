import { useQuery } from 'react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import useRes from './useRes';

export default (agenda, params) => {
  const res = useRes(agenda);
  const {
    page = '1'
  } = useParams();
  const size = useSelector(state => state.settings.pageSize);
  const from = size * (page - 1);

  const { isLoading, error, data } = useQuery(`locations-${JSON.stringify(params)}-${from}`, () => (
    axios.get(res.index, { params: { ...params, from, size } }).then(response => response.data)
  ));
  return {
    isLoading,
    error,
    locations: data?.locations,
    total: data?.total,
    page: parseInt(page, 10),
    size,
  };
};
