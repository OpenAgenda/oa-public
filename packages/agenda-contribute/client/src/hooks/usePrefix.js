import { useSelector } from 'react-redux';

export default function usePrefix(agenda) {
  return useSelector(state => state.settings.prefix).replace(':slug', agenda.slug);
}
