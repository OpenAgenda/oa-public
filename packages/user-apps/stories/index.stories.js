import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {},
  res: {
    getMe: '/users/me',
    updateProfile: '/users/me',
    deleteAccount: '/users/me',
    changeEmail: '/users/me/requestChangeEmail',
    changePassword: '/users/me/changePassword',
    generateApiKey: '/users/me/generateApiKey'
  }
});

export default {
  title: 'App',
  parameters: {
    msw: {
      handlers: [
        rest.get('/users/me', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 500));

          return res(
            ctx.json({
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
            }),
          );
        }),
        rest.delete('/users/me', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 2000));
          return res(ctx.status(403));
        }),
        rest.patch('/users/me/requestChangeEmail', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 2000));
          /* return res(ctx.status(400), ctx.json({
            name: 'BadRequest',
            message: 'Already exist',
            code: 400,
            className: 'bad-request',
          })); */

          return res(ctx.status(200));
        }),
      ],
    },
  },
};

export function All() {
  return wrapApp(createApp({
    history: createMemoryHistory(),
    initialState: getDefaultState()
  }), {
    extraProps: {
      user: {
        id: 1,
        uid: 75052324
      },
      lang: 'fr'
    }
  });
}
