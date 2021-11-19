import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useDetailedSchema(agenda) {
  const res = useSelector(state => state.APIRoot + state.res.detailedSchema.replace(':agendaUid', agenda.uid));

  const {
    isLoading: detailedSchemaIsLoading,
    data: detailedSchema
  } = useQuery(
    'detailedSchema',
    () => axios.get(res).then(response => response.data.schema)
  );

  return {
    detailedSchemaIsLoading,
    detailedSchema
  };
}
