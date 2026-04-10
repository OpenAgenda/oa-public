import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import { LoggedUserWelcome } from 'components/strapi/LoggedUserWelcome';
import fetchLocale from 'app/locales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import userFixtures from './fixtures/user.json';

export default {
  title: 'strapi/LoggedUserWelcome',
  decorators: [ProvidersDecorator],
  component: LoggedUserWelcome,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
};

export function Connected() {
  const user = useUser();
  return (
    <Box display="flex" flexDirection="column" height="200vh">
      <LoggedUserWelcome user={user} />
    </Box>
  );
}

Connected.parameters = {
  msw: {
    handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
  },
};
