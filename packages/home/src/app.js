import _ from 'lodash';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      apiRoot: 'http://localhost:3000',
    },
    res: {
      list: '/agendas',
      create: '/agendas/new',
      events: '/home/events',
      messages: '/home/messages',
      notifs: '/home/notifications',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      search: '/agendas',
    },
    menu: {},
    agendas: {},
  },
};

export default function (options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix, rootPrefix } = initialState.settings;

  const getApp = () => createApp({
    name: 'home',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes: () => getRoutes(prefix, rootPrefix),
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
