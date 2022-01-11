import { useSelector } from 'react-redux';

export default function useEventRes(agenda, event) {
  return useSelector(
    state => state.res.event
      .replace(':agendaUid', agenda.uid)
      .replace(':eventUid', event.uid)
  );
}
