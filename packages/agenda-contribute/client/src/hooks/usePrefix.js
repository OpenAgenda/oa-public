import { useSelector } from 'react-redux';

export default function usePrefix(agenda) {
  return useSelector(state => state.prefix).replace(':agendaSlug', agenda.slug);
}
