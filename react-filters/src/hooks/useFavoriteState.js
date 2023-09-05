import { useCallback } from 'react';
import { createLocalStorageStateHook } from 'use-local-storage-state';

const useFavoriteLocalStorageState = createLocalStorageStateHook('favorite-events');

export default function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();

  const setAgendaValue = useCallback(fnOrValue => {
    if (typeof fnOrValue === 'function') {
      setValue(prev => ({
        ...prev,
        [agendaUid]: fnOrValue(prev?.[agendaUid])
      }));
    } else {
      setValue(prev => ({
        ...prev,
        [agendaUid]: fnOrValue
      }));
    }
  }, [setValue, agendaUid]);

  return [
    value?.[agendaUid],
    setAgendaValue
  ];
}
