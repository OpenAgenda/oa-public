import _ from 'lodash';
import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import { withTestServer } from './helpers/startTestServer.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'trackers',
];

describe('08 - core - functional (server): core.agendas().members.list', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['009.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(2).members.list(
        {},
        { limit: 2 },
        {
          userUid: 50073466,
        },
      );
    });

    it('total, items and after keys are part of results', () => {
      expect(result.total).toBe(6);

      expect(_.isArray(result.items)).toBe(true);
      expect(_.isInteger(result.after)).toBe(true);
    });

    it('next result set can be fetched using "after" value', async () => {
      const nextResult = await core.agendas(2).members.list(
        {},
        { after: result.after },
        {
          userUid: 50073466,
        },
      );

      expect(nextResult.items.length).toBe(4);
    });

    it('customAtRoot option', async () => {
      const { items } = await core.agendas(2).members.list(
        {},
        {},
        {
          customAtRoot: true,
          userUid: 50073466,
        },
      );

      expect(_.omit(items[0], 'updatedAt')).toEqual({
        deletedUser: false,
        name: 'Jan',
        phone: null,
        email: null,
        position: null,
        organization: null,
        role: 'contributor',
        userUid: 1,
      });
    });
  });

  it('list custom values', async () => {
    const result = await core.agendas(3).members.list(
      {},
      { limit: 2 },
      {
        userUid: 1,
      },
    );

    expect(result.items.find((e) => e.userUid === 6887).num_orga).toBe('30org');
    expect(_.isArray(result.items)).toBe(true);
    expect(_.isInteger(result.after)).toBe(true);
  });

  describe('unauthorized', () => {
    it('non-member user does not have access to list', async () => {
      let error;
      try {
        await core.agendas(2).members.list(
          {},
          { limit: 2 },
          {
            userUid: 99999967,
          },
        );
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('Forbidden');
    });

    it('contributor user does not have access to list', async () => {
      let error;
      try {
        await core.agendas(2).members.list(
          {},
          { limit: 2 },
          {
            userUid: 1,
          },
        );
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('Forbidden');
    });
  });

  describe('stream', () => {
    it('stream userUids', async () => {
      const stream = await core.agendas(3).members.stream(
        {},
        { limit: 1 },
        {
          userUid: 1,
          transform: (m) => m.userUid,
        },
      );

      return new Promise((rs) => {
        const result = [];
        stream.on('data', (b) => {
          result.push(b);
        });

        stream.on('end', () => {
          expect(result).toStrictEqual([1, 6887]);
          rs();
        });
      });
    });
  });

  describe('api', () => {
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1NL';
    const contributorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    const nonMemberKey = 'oI8hAhFOm1if8auC1Vg1NLegP36aMb0t';

    const ctx = withTestServer(() => api(core, { useRouter: false }));

    describe('successful call', () => {
      let response;

      beforeAll(async () => {
        response = await ky
          .get(`${ctx.baseUrl}/agendas/2/members?key=${administratorKey}`)
          .json();
      });

      it('response includes a success, total, a list of items and an after key', () => {
        expect(Object.keys(response)).toEqual([
          'total',
          'after',
          'items',
          'success',
        ]);
      });
    });

    describe('unsuccessful calls', () => {
      it('Bad Request', async () => {
        const response = await ky
          .get(
            `${ctx.baseUrl}/agendas/2/members?key=${administratorKey}&limit=1111`,
          )
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(400);

        expect((await response.json()).errors).toEqual([
          {
            code: 'integer.toobig',
            message: 'the integer is too big',
            values: { max: 100 },
            origin: '1111',
            field: 'size',
          },
        ]);
      });

      it('Contributor does not have access to list', async () => {
        const response = await ky
          .get(`${ctx.baseUrl}/agendas/2/members?key=${contributorKey}`)
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(403);
      });

      it('Non-member does not have access to list', async () => {
        const response = await ky
          .get(`${ctx.baseUrl}/agendas/2/members?key=${nonMemberKey}`)
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(403);
      });
    });
  });
});
