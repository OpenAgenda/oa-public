import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
  'accessTokens',
  'bull',
  'files',
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
  'activities',
  'inboxes',
  'agendaSearch',
];

describe('core - functional (server): core.agendas().remove()', () => {
  let core;

  const config = testConfig.extendWith({
    cachePrefix: 'core_agendas_remove_test',
    queuesPrefix: 'qagendasremove:',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['009.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('agenda with members', () => {
    const agendaUid = 2;

    it('agenda and members exist before removal', async () => {
      const agenda = await core.services.agendas.get(
        { uid: agendaUid },
        { internal: true, private: null },
      );
      expect(agenda).toBeTruthy();
      expect(agenda.uid).toBe(agendaUid);

      const { total } = await core.services.members.list(
        { agendaUid },
        {},
        { total: true },
      );
      expect(total).toBeGreaterThan(0);
    });

    it('removes agenda and cleans up members via background task', async () => {
      await new Promise((resolve, reject) => {
        // start the worker before triggering the remove so the task
        // is picked up as soon as onRemove enqueues it
        core.tasks({
          error(...args) {
            reject(args[0]);
          },
          failed(job, error) {
            reject(error);
          },
          completed(job) {
            if (job.name === 'removeAgendaMembers') resolve();
          },
        });

        core.agendas(agendaUid).remove().catch(reject);
      });

      // agenda is soft-deleted (not returned by default)
      const liveAgenda = await core.services.agendas.get(
        { uid: agendaUid },
        { internal: true, private: null },
      );
      expect(liveAgenda).toBeNull();

      // still retrievable with deleted: true, and deletedAt is set
      const softDeleted = await core.services.agendas.get(
        { uid: agendaUid },
        { internal: true, private: null, deleted: true },
      );
      expect(softDeleted).toBeTruthy();
      expect(softDeleted.deletedAt).toBeInstanceOf(Date);

      // members are removed by the background task
      const { total: membersAfter } = await core.services.members.list(
        { agendaUid },
        {},
        { total: true },
      );
      expect(membersAfter).toBe(0);
    });

    afterAll(async () => {
      await core.tasks.clear();
    });
  });
});
