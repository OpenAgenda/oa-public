import { http, HttpResponse } from 'msw';
import Layout from 'components/Layout';
import fetchLocale from 'app/locales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import userFixtures from './fixtures/user.json';

export default {
  title: 'components/Layout',
  component: Layout,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

export const NotConnected = () => <Layout>Sample content</Layout>;

export const Connected = {
  render: () => <Layout>Sample content</Layout>,
  parameters: {
    msw: {
      handlers: [http.get('/users/me', () => HttpResponse.json(userFixtures))],
    },
  },
};

export const WithDangerAnnouncement = {
  render: () => {
    localStorage.removeItem('oa:announcement');
    return <Layout>Sample content</Layout>;
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () =>
          HttpResponse.json({
            ...userFixtures,
            announcement: {
              id: '2023-12-13T09:35:17.286Z',
              content:
                'Un truc est complètement H.S. [Cliquez ici pour en savoir plus](https://openagenda.com)',
              kind: 'danger',
            },
          }),
        ),
      ],
    },
  },
};

export const WithWarningAnnouncement = {
  render: () => {
    localStorage.removeItem('oa:announcement');
    return <Layout>Sample content</Layout>;
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', () =>
          HttpResponse.json({
            ...userFixtures,
            announcement: {
              id: '2023-12-13T09:35:17.286Z',
              content:
                'Un truc est pas tout à fait mais un peu H.S. quand même [Cliquez ici pour en savoir plus](https://openagenda.com)',
              kind: 'warning',
            },
          }),
        ),
      ],
    },
  },
};
