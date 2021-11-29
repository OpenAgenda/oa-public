import {
  createApp
} from '@openagenda/react-shared';

import getRoutes from './getRoutes';

export default function agendaLocationsApp(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState.settings;

  const getApp = createApp.bind(null, {
    ...options,
    name: 'agendaLocationApp', // simplifie le debug. Ce n'est pas un composant -> minuscule
    initialState,
    apiRoot,
    prefix,
    getRoutes
  });

  const app = getApp();

/*   if (module.hot) {
    module.hot.accept('./getRoutes', () => {
      const newApp = getApp();

      app.Content = newApp.Content;
      app.triggerHooks = newApp.triggerHooks;
    });
  } */

  return app;
}
