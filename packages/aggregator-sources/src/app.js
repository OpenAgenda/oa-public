import _ from 'lodash';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '/aggregatorSources',
      perPageLimit: 20,
    },
    res: {
      list: '/sources.json',
      showAgenda: '#',
      remove: '#',
      search: '#',
    },
    agenda: {},
    sources: {},
    modals: {},
  },
};

export default function (options) {
  const { initialState } = _.merge({}, defaults, options);
  const { prefix } = initialState.settings;

  const getApp = () => createApp({
    ...options,
    initialState,
    prefix,
    getRoutes,
    legacyApiClient: true,
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
