import _ from 'lodash';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/agendaStats',
      apiRoot: `localhost:${process.env.PORT || 3000}`
    },
    res: {}
  }
};

export default function (options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp({
    name: 'agenda-stats',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes
  });

  const result = getApp();

  if (module.hot) {
    module.hot.accept('./getRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
