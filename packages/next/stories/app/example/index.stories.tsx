import { http, HttpResponse } from 'msw';
import ExamplePage from 'app/example/page';
import AppLayout from 'components/app/Layout';
import fetchLocale from 'app/locales';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import userFixtures from '../../components/fixtures/user.json';

export default {
  title: 'app/example',
  component: ExamplePage,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/example',
      },
    },
  },
};

export const NotConnected = {
  render: () => (
    <AppLayout>
      <ExamplePage />
    </AppLayout>
  ),
};

export const Connected = {
  render: () => (
    <AppLayout>
      <ExamplePage />
    </AppLayout>
  ),
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};
