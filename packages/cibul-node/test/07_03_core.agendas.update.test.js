import { produce } from 'immer';

import Services from '../services/init.js';
import Core from '../core/index.js';

import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('07 - core - functional (server): core.agendas().update', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '008.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
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

      const { settings: updatedSettings, title: unchangedTitle } = await core
        .agendas(92983929)
        .update({
          settings: produce(settings, (draft) => {
            draft.contribution.messages.instructions = 'Une instruction';
          }),
        });

      expect(updatedSettings.contribution.messages.instructions).toBe(
        'Une instruction',
      );
      expect(title).toBe(unchangedTitle);
    });

    it('update agenda is in fact a patch', async () => {
      const { settings, description, title } = await core
        .agendas(17026800)
        .get({
          detailed: true,
          access: 'administrator',
        });

      expect(settings.contribution.allowLocationCreate).toBe(true);
      expect(description).toBe('Une description petite');
      expect(title).toBe('Le Fennec');

      await core.agendas(17026800).update({
        settings: { contribution: { allowLocationCreate: false } },
      });

      await core.agendas(17026800).update({
        description: 'Petit mammifère des sables',
        settings: {
          contribution: {
            messages: {
              instructions: 'Quelques instructions',
            },
          },
        },
      });

      await core.agendas(17026800).update({
        title: 'Fennec le',
        settings: {
          contribution: {
            messages: {
              publication: 'Votre événement est publié!',
            },
          },
        },
      });

      const {
        settings: updatedSettings,
        title: updatedTitle,
        description: updatedDescription,
      } = await core.agendas(17026800).get({
        detailed: true,
        access: 'administrator',
      });

      expect(updatedTitle).toBe('Fennec le');
      expect(updatedDescription).toBe('Petit mammifère des sables');
      expect(updatedSettings.contribution.allowLocationCreate).toBe(false);
      expect(updatedSettings.contribution.messages.instructions).toBe(
        'Quelques instructions',
      );
      expect(updatedSettings.contribution.messages.publication).toBe(
        'Votre événement est publié!',
      );
    });
  });
});
