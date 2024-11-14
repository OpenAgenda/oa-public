import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes.js';

export default function contribute(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState.settings;

  initialState.contribute = initialState.contribute ?? {};

  return createApp({
    name: 'agendaContribute',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes,
  });
}
