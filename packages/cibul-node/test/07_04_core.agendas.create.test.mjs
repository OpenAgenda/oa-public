import Services from '../services/init.js';
import Core from '../core/index.js';

import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('07 - core - functional (server): core.agendas().create', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '008.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'bull',
        'files',
        'events',
        'accessTokens',
        'agendas',
        'aggregators',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'tracker',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('basic case', () => {
      let agenda;

      beforeAll(async () => {
        agenda = await core.agendas.create({
          title: 'Un agenda',
          description: 'pour tester la création',
        }, { userUid: 63170203 });
      });

      it('agenda is created', async () => {
        expect(agenda.title).toBe('Un agenda');
      });

      it('user is administrator of agenda', async () => {
        const member = await core.agendas(agenda.uid).members.get(63170203, { access: 'internal' });

        expect(member.role).toBe('administrator');
      });
    });
  });
});
