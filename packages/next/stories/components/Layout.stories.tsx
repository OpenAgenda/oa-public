import { http, HttpResponse } from 'msw';
import Layout from 'components/Layout';
import fetchAllLocales from '../utils/fetchAllLocales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import userFixtures from './fixtures/user.json';

export default {
  title: 'components/Layout',
  component: Layout,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
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

export const WithAnnouncement = {
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
                "Oulala, c'est la décadence **han** !\n\n"
                + 'Lorem ipsum dolor sit amet,\n'
                + 'consectetur adipisicing elit.\n'
                + 'Ab amet at, autem commodi eaque enim eum fugiat illo iure necessitatibus neque,\n'
                + 'nesciunt nisi porro quasi quo sint veniam veritatis voluptate. [test](/home) [test](https://google.fr)\n\n'
                + '![image](https://imagesdev-1cb1b.kxcdn.com/user.profile.75052324.jpg?format=webp&width=32)',
              kind: 'danger',
            },
          })),
      ],
    },
  },
};
