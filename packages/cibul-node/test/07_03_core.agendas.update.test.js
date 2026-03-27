import fs from 'node:fs';
import { produce } from 'immer';

import Services from '../services/init.js';
import Core from '../core/index.js';
import api from '../api/index.js';

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

    await services.formSchemas.clearCache();
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

    it('superadmin can update protected fields', async () => {
      const beforeUpdate = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal',
      });

      expect(beforeUpdate.private).toBeFalsy();
      expect(beforeUpdate.official).toBeFalsy();

      const superAdminUser = await core.users.get(838438477721);

      // Update as superadmin with protected: false
      const updatedAgenda = await core.agendas(92983929).update(
        {
          private: 1,
          official: 1,
        },
        {
          protected: false, // Only superadmins can do this
          internal: true, // Need to see internal/protected fields
          private: null, // Don't filter by private status when fetching
          userUid: 838438477721, // Superadmin UID
          context: {
            user: superAdminUser,
          },
        },
      );

      expect(updatedAgenda.private).toBeTruthy();
      expect(updatedAgenda.official).toBeTruthy();
    });

    it('regular admin cannot update protected fields', async () => {
      const beforeAttempt = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal',
        private: null,
      });

      const regularUser = await core.users.get(63170200);

      const attemptedUpdate = await core.agendas(92983929).update(
        {
          private: 0, // Try to change to public
          official: 0, // Try to change to unofficial
          title: 'New title', // Non-protected field
        },
        {
          userUid: 63170200, // Regular admin
          internal: true, // Need to see protected fields in result
          private: null, // Don't filter by private status when fetching
          context: {
            user: regularUser,
          },
          // protected defaults to true, so protected fields will be filtered out
        },
      );

      expect(attemptedUpdate.private).toBe(beforeAttempt.private);
      expect(attemptedUpdate.official).toBe(beforeAttempt.official);
      expect(attemptedUpdate.title).toBe('New title');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await fetch(
        'http://localhost:4000/requestAccessToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
          }),
        },
      ).then((r) => r.json());
      accessToken = tokenResponse.access_token;
    });

    beforeAll(
      () =>
        new Promise((rs) => {
          fs.createReadStream(`${import.meta.dirname}/fixtures/pirates.jpg`)
            .pipe(fs.createWriteStream('/tmp/pirates.jpg'))
            .on('close', rs);
        }),
    );

    it('update agenda with image', async () => {
      const form = new FormData();

      form.append(
        'image',
        await fs.openAsBlob('/tmp/pirates.jpg'),
        'pirates.jpg',
      );
      form.append('access_token', accessToken);
      form.append('data', JSON.stringify({ title: 'Agenda avec image' }));

      const response = await fetch('http://localhost:4000/agendas/92983929', {
        method: 'PATCH',
        body: form,
      }).then((r) => r.json());

      expect(response.title).toBe('Agenda avec image');
      expect(response.image).toBeDefined();
      expect(response.image).toMatch(/^https?:\/\//);
    });
  });
});
