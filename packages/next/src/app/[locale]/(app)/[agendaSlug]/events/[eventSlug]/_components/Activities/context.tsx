'use client';

import { createContext } from '@/src/utils/createContext';

const [ActivitiesProvider, useActivitiesContext] = createContext({
  strict: true,
  name: 'ActivitiesContext',
  hookName: 'useActivitiesContext',
  providerName: 'ActivitiesProvider',
});

export { ActivitiesProvider, useActivitiesContext };
