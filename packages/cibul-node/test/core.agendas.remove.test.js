import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().remove()', () => {
  let core;

  const config = testConfig.extendWith({
    cachePrefix: 'core_agendas_remove_test',
    queuesPrefix: 'qagendasremove:',
  });

  beforeAll(() => loadFixtures(config.db, '009.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
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
        'keys',
        'trackers',
        'activities',
        'inboxes',
        'agendaSearch',
      ],
    });

    core = Core(services, config);

    await services.formSchemas.clearCache();
    await services.members.clearCache();
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

      const members = await core.services
        .knex('reviewer')
        .select()
        .where({ agenda_uid: agendaUid });
      expect(members.length).toBeGreaterThan(0);
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

      // agenda is removed from the database
      const agendaRows = await core.services
        .knex('review')
        .select()
        .where({ uid: agendaUid });
      expect(agendaRows.length).toBe(0);

      // members are removed by the background task
      const membersAfter = await core.services
        .knex('reviewer')
        .select()
        .where({ agenda_uid: agendaUid });
      expect(membersAfter.length).toBe(0);
    });

    afterAll(async () => {
      await core.tasks.clear();
    });
  });
});
