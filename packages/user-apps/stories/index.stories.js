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
    keys: {
      list: '/users/me/api-keys',
      create: '/users/me/api-keys',
      update: '/users/me/api-keys/:id',
      remove: '/users/me/api-keys/:id',
    },
  },
});

// In-memory key store for the api-keys endpoints. Seeded with one legacy
// `mirror` key (shown in full, like the pre-migration UI) and one native key
// (masked — its plaintext was only ever shown at creation).
let mockKeys = [
  {
    id: '1001',
    name: 'Import connector',
    start: 'oMXMSQ',
    metadata: { oaKind: 'sk' },
  },
  {
    id: '1002',
    name: null,
    start: '0c1eadf824924b5d8a1b1c5f191aea7c',
    metadata: { oaKind: 'pk', legacyType: 'userPublic', source: 'mirror' },
  },
];
let mockNextId = 2000;

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
        http.get('/users/me/api-keys', async () => {
          await delay(300);
          return HttpResponse.json({
            items: mockKeys,
            total: mockKeys.length,
          });
        }),
        http.post('/users/me/api-keys', async ({ request }) => {
          await delay(300);
          const { oaKind } = await request.json();
          const id = String(mockNextId);
          mockNextId += 1;
          const key = `oa_${oaKind}_${id}0000000000000000000000`;
          const record = {
            id,
            name: null,
            start: key.slice(0, 6),
            metadata: { oaKind },
          };
          mockKeys = [record, ...mockKeys];
          return HttpResponse.json({ key, record }, { status: 201 });
        }),
        http.patch('/users/me/api-keys/:keyId', async ({ request, params }) => {
          await delay(300);
          const { name } = await request.json();
          let record = null;
          mockKeys = mockKeys.map((k) => {
            if (k.id !== params.keyId) return k;
            record = { ...k, name };
            return record;
          });
          if (!record) return new HttpResponse(null, { status: 404 });
          return HttpResponse.json({ record });
        }),
        http.delete('/users/me/api-keys/:keyId', async ({ params }) => {
          await delay(300);
          const before = mockKeys.length;
          mockKeys = mockKeys.filter((k) => k.id !== params.keyId);
          if (mockKeys.length === before) {
            return new HttpResponse(null, { status: 404 });
          }
          return HttpResponse.json({ removed: true });
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
