import { http, HttpResponse } from 'msw';
import Navbar from 'components/Navbar';
import fetchAllLocales from '../utils/fetchAllLocales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import userFixtures from './fixtures/user.json';

export default {
  title: 'components/Navbar',
  component: Navbar,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

export const NotConnected = () => <Navbar />;

export const Connected = {
  render: () => <Navbar />,
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};
