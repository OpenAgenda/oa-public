import _ from 'lodash';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '/members',
      apiRoot: `http://localhost:${process.env.PORT || 9001}`,
      perPageLimit: 20,
    },
    res: {
      list: '/sources.json',
      stats: '#',
    },
    agenda: {
      title: 'La gargouille',
      slug: 'la-gargouille',
    },
  },
};

export default function app(options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  return createApp({
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes,
    legacyApiClient: true,
  });
}
