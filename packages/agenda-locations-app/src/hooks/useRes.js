import { useSelector } from 'react-redux';

export default agenda => {
  const APIRoot = useSelector(state => state.settings.apiRoot);
  const res = useSelector(state => state.res);
  return (Object.keys(res).reduce((carry, key) => ({ ...carry, [key]: `${APIRoot}${res[key].replace(':agendaUid', agenda.uid).replace(':agendaSlug', agenda.slug)}` }), {}));
};
