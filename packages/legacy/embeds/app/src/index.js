import {
  createApp
} from '@openagenda/react-shared';
import getRoutes from './getRoutes';

export default function embeds(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState;

  const getApp = createApp.bind(null, {
    ...options,
    name: 'legacyEmbeds',
    initialState,
    apiRoot,
    prefix,
    getRoutes
  });

  const app = getApp();

  if (module.hot) {
    module.hot.accept('./getRoutes', () => {
      const newApp = getApp();

      app.Content = newApp.Content;
      app.triggerHooks = newApp.triggerHooks;
    });
  }

  return app;
}
