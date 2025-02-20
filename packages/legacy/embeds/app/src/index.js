import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes.js';

export default function embeds(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState;

  return createApp({
    ...options,
    name: 'legacyEmbeds',
    initialState,
    apiRoot,
    prefix,
    getRoutes,
  });
}
