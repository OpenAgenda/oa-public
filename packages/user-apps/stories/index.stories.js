import { createMemoryHistory } from 'history';
import { http, HttpResponse, delay } from 'msw';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app.js';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {},
  res: {
    getMe: '/users/me',
    updateProfile: '/users/me',
    deleteAccount: '/users/me',
    changeEmail: '/users/me/requestChangeEmail',
    generateApiKey: '/users/me/generateApiKey',
  },
});

export default {
  title: 'App',
  parameters: {
    msw: {
      handlers: [
        http.get('/users/me', async () => {
          await delay(500);

          return HttpResponse.json({
            id: 11258,
            uid: 31046551,
            fullName: 'Ké vin Berthommier - OpenAgenda',
            username: 'kvin-berthommier',
            email: 'kevin.bertho@gmail.com',
            culture: 'fr',
            image: null,
            isNew: false,
            createdAt: '2016-03-10T13:03:22.000Z',
            updatedAt: '2021-02-15T16:09:25.000Z',
            hasSocialAccount: true,
            hasLocalAccount: true,
            announcement: null,
          });
        }),
        http.delete('/users/me', async () => {
          await delay(2000);
          return new HttpResponse(null, { status: 403 });
        }),
        http.patch('/users/me/requestChangeEmail', async () => {
          await delay(2000);
          /* return res(ctx.status(400), ctx.json({
            name: 'BadRequest',
            message: 'Already exist',
            code: 400,
            className: 'bad-request',
          })); */

          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
};

export function All() {
  return wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        user: {
          id: 1,
          uid: 75052324,
        },
        lang: 'fr',
      },
    },
  );
}
