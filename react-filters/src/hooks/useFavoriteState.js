import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export default function useFavoriteState(agendaUid) {
  const [value, setValue] = useLocalStorageState('favorite-events');

  const setAgendaValue = useCallback(
    (fnOrValue) => {
      if (typeof fnOrValue === 'function') {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue(prev?.[agendaUid]),
        }));
      } else {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue,
        }));
      }
    },
    [setValue, agendaUid],
  );

  return [value?.[agendaUid], setAgendaValue];
}
