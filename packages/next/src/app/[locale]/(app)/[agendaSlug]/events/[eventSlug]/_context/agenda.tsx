'use client';

import { createContext, useContext } from 'react';
import type { Agenda } from '@/src/types';

const agendaContext = createContext<Agenda>(null);

export function AgendaProvider({ agenda, children }) {
  return (
    <agendaContext.Provider value={agenda}>{children}</agendaContext.Provider>
  );
}

export function useAgenda() {
  return useContext(agendaContext);
}
