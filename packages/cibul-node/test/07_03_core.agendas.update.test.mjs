import { produce } from 'immer';

import Services from '../services/init.mjs';
import Core from '../core/index.js';

import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('07 - core - functional (server): core.agendas().update', () => {
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
    it('update agenda settings', async () => {
      const { settings, title } = await core.agendas(92983929).get({
        detailed: true,
        access: 'administrator',
      });

      const {
        settings: updatedSettings,
        title: unchangedTitle,
      } = await core.agendas(92983929).update({
        settings: produce(settings, draft => {
          draft.contribution.messages.instructions = 'Une instruction';
        }),
      });

      expect(updatedSettings.contribution.messages.instructions).toBe('Une instruction');
      expect(title).toBe(unchangedTitle);
    });
  });
});
