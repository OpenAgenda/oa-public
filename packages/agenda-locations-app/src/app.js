import {
  createApp,
} from '@openagenda/react-shared';

import getRoutes from './getRoutes';

export default function (options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState.settings;

  const getApp = createApp.bind(null, {
    ...options,
    name: 'agendaLocationApp', // simplifie le debug. Ce n'est pas un composant -> minuscule
    initialState,
    apiRoot,
    prefix,
    getRoutes,
  });

  const app = getApp();

  return app;
}
