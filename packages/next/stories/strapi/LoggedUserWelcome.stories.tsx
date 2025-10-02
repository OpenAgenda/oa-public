import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import LoggedUserWelcome from 'components/strapi/LoggedUserWelcome';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import fetchAllLocales from '../utils/fetchAllLocales';

import userFixtures from './fixtures/user.json';

export default {
  title: 'strapi/LoggedUserWelcome',
  decorators: [ProvidersDecorator],
  component: LoggedUserWelcome,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
    }),
  ],
};

export const NotConnected = () => <LoggedUserWelcome />;

export const Connected = {
  render: () => (
    <Box display="flex" flexDirection="column" height="200vh">
      <LoggedUserWelcome />
    </Box>
  ),
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};
