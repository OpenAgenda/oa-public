import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
  'bull',
  'files',
  'events',
  'agendas',
  'agendaEvents',
  'aggregators',
  'agendaLocations',
  'registrations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'accessTokens',
  'tracker',
];

describe('core - functional (server): core.agendas().events.update()', () => {
  let core;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_update_auth',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['004.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(17026855).events.search.rebuild();
    await core.agendas(9491431).events.search.rebuild();
    await core.agendas(55555555).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('access option', () => {
      const data = {
        title: {
          fr: 'Un autre événement mis à jour',
        },
        description: {
          fr: 'Une description',
        },
        image: {
          filename: 'fdqfsdq.jpg',
        },
        locationUid: 123,
        timings: [
          {
            begin: new Date('2019-12-18T14:30:00'),
            end: new Date('2019-12-18T15:30:00'),
          },
        ],
        'organisation-interne': 'Il faut que René y aille',
        categories: 2,
      };

      it('a contributor access cannot update an administrator field', async () => {
        let errors;
        try {
          await core
            .agendas(92983929)
            .events.update(19390293, data, { access: 'contributor' });
        } catch (e) {
          errors = e.info.errors;
        }

        expect(errors).toStrictEqual([
          {
            field: 'organisation-interne',
            code: 'unauthorized',
            message: 'not authorized to edit this field',
            step: 'validation',
          },
          {
            origin: undefined,
            code: 'required',
            message: 'a string is required',
            field: 'organisation-interne',
            step: 'validation',
          },
        ]);

        expect(await core.services.custom(5).get(19390293)).toEqual({
          'organisation-interne': 'Il faut que Thérèse y soit',
        });
      });

      it('an administrator access can patch an administrator field', async () => {
        await core.agendas(92983929).events.patch(
          19390294,
          {
            'organisation-interne': 'Il faut que René y aille',
          },
          {
            access: 'administrator',
          },
        );

        expect(await core.services.custom(5).get(19390294)).toEqual({
          'organisation-interne': 'Il faut que René y aille',
        });
      });

      it('a moderator cannot publish if role is not in agenda canPublish list', async () => {
        let error;
        await core.agendas(37026800).events.patch(
          88888888,
          {
            'categories-agenda-metropolitain': 42,
          },
          { access: 'internal' },
        );
        try {
          await core.agendas(37026800).events.patch(
            88888888,
            {
              state: 2,
            },
            {
              access: 'moderator',
            },
          );
        } catch (e) {
          error = e;
        }
        expect(error.message).toBe('not authorized to publish events');
      });
    });

    describe('agenda access on event', () => {
      it('an agenda with ref can_edit at 0 cannot patch event', async () => {
        let error;
        try {
          await core.agendas(92983929).events.patch(
            99999999,
            {
              description: {
                fr: 'Une desc patchée',
              },
            },
            {
              access: 'moderator',
            },
          );
        } catch (e) {
          error = e;
        }
        expect(error.message).toEqual('not authorized to edit event');
      });

      it('an agenda wih ref can_edit at 1 can patch event', async () => {
        const updated = await core.agendas(17026855).events.patch(
          99999999,
          {
            title: {
              fr: 'Un titre patché',
            },
            'categories-agenda-metropolitain': 42,
          },
          {
            access: 'administrator',
          },
        );

        expect(updated.title.fr).toBe('Un titre patché');
      });

      it('if agenda does not have edit access and patch excludes event-specific data, patch can occur', async () => {
        const patched = await core.agendas(92983929).events.patch(
          99999999,
          {
            state: 2,
          },
          {
            access: 'moderator',
          },
        );

        expect(patched.state).toBe(2);
      });
    });

    describe('state change rights', () => {
      it('contributor does not have access to event state change', async () => {
        const { state: stateBefore } = await core.services
          .agendaEvents(17026855)
          .get(19201989);

        await core.agendas(17026855).events.patch(
          19201989,
          {
            state: 1,
          },
          {
            access: 'contributor',
          },
        );

        const { state: stateAfter } = await core.services
          .agendaEvents(17026855)
          .get(19201989);

        expect(stateBefore).toEqual(stateAfter);
        expect(stateAfter !== 1).toBeTruthy();
      });

      it('administrator can change state', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            state: 2,
          },
          {
            access: 'administrator',
          },
        );
        expect(event.state).toBe(2);
      });

      it('moderator can change state', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            state: 1,
          },
          {
            access: 'moderator',
          },
        );
        expect(event.state).toEqual(1);
      });

      it('moderator can add motive when refusing event', async () => {
        const event = await core.agendas(17026855).events.patch(
          88888888,
          {
            state: -1,
            motive: '😬',
          },
          {
            access: 'moderator',
          },
        );

        expect(event.motive).toBe('😬');
      });

      it('when published event is updated by role listed in moderateOnChangeBy, state reverts to 0', async () => {
        const event = await core.agendas(92983929).events.patch(
          19390293,
          {
            title: {
              fr: 'Titre modifié',
            },
          },
          {
            access: 'contributor',
          },
        );

        expect(event.state).toBe(0);
      });

      it('location ref can be patched', async () => {
        const event = await core.agendas(92983929).events.patch(
          19390293,
          {
            locationUid: 73780602,
          },
          {
            access: 'moderator',
          },
        );

        expect(event.location.uid).toBe(73780602);
      });

      it('moderator can change state to refused (-1) and add a motive', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            state: -1,
            motive: '¬_¬',
          },
          {
            access: 'moderator',
          },
        );

        expect(event.motive).toBe('¬_¬');
      });

      it('invalid event can be unpublished, it stays invalid', async () => {
        const result = await core
          .agendas(9491431)
          .events.patch(12993376, { state: 0 }, { access: 'internal' });

        expect(result.state).toBe(0);
        expect(result.valid).toBe(false);
      });

      it('invalid event cannot be published', async () => {
        let error;
        try {
          await core
            .agendas(9491431)
            .events.patch(12993376, { state: 2 }, { access: 'internal' });
        } catch (e) {
          error = e;
        }
        expect(error.name).toBe('BadRequest');
      });

      it('invalid event with additional values cannot be published', async () => {
        let error;
        try {
          await core
            .agendas(64260763)
            .events.patch(38298329, { state: 2 }, { access: 'internal' });
        } catch (e) {
          error = e;
        }
        expect(error.name).toBe('BadRequest');
      });
    });

    describe('access by member authorization', () => {
      it('change state as admin member', async () => {
        const event = await core.agendas(64260763).events.patch(
          3969008,
          {
            state: 1,
          },
          {
            userUid: 10866730, // helene
          },
        );

        expect(event.state).toBe(1);
      });

      it('contributor cannot publish event if agenda default state is to be moderated', async () => {
        let errorMessage;
        try {
          await core.agendas(64260763).events.patch(
            3969008,
            {
              state: 2,
            },
            {
              userUid: 24372732, // chrissie
            },
          );
        } catch (e) {
          errorMessage = e.message;
        }

        expect(errorMessage).toBe('not authorized to publish events');
      });

      it('administrator of agenda without edit rights over event cannot edit event', async () => {
        let errorMessage;
        try {
          await core.agendas(89904399).events.patch(
            3969008,
            {
              title: 'Un titre mis à jour',
            },
            {
              userUid: 82253124, // Admin of MEL
            },
          );
        } catch (e) {
          errorMessage = e.message;
        }

        expect(errorMessage).toBe('not authorized to edit event');
      });

      it('administrator of agenda without edit rights can change featured value of event', async () => {
        const event = await core.agendas(89904399).events.patch(
          3969008,
          {
            featured: true,
          },
          {
            userUid: 82253124, // Admin of MEL
          },
        );

        expect(event.featured).toBe(true);
      });

      it('creator of event which is contributor in non-origin agenda without edit rights can edit event from non-origin agenda', async () => {
        const event = await core.agendas(89904399).events.patch(
          3969008,
          {
            title: { fr: 'Patché' },
          },
          {
            userUid: 10866730,
          },
        );

        expect(event.title.fr).toBe('Patché');
      });

      it('additional field value is not dropped from index on patch', async () => {
        const {
          events: [event],
        } = await core.agendas(92983929).events.search(
          {
            state: null,
            uid: 19390294,
          },
          {},
          {
            detailed: true,
            access: 'administrator',
          },
        );

        expect(event.categories).toBe(2);

        await core
          .agendas(92983929)
          .events.patch(
            19390294,
            {
              title: { fr: 'Et bim' },
            },
            {
              access: 'administrator',
            },
          )
          .then(
            () => {},
            (e) => console.log(e),
          );

        const {
          events: [patchedEvent],
        } = await core.agendas(92983929).events.search(
          {
            state: null,
            uid: 19390294,
          },
          {},
          {
            detailed: true,
            access: 'administrator',
          },
        );

        expect(patchedEvent.categories).toBe(2);
      });
    });

    describe('per-field authorization', () => {
      it('moderator cannot update contributor-restricted field', async () => {
        let errors;
        try {
          await core.agendas(55555555).events.patch(
            77777778,
            {
              contributorOnlyField: 'attempted by moderator',
              title: { fr: 'Titre modifié par moderator' },
            },
            {
              userUid: 82253124, // thibaud - moderator
              filterUnauthorizedData: false, // temporary
            },
          );
        } catch (e) {
          errors = e.info.errors;
        }

        expect(errors).toStrictEqual([
          {
            field: 'contributorOnlyField',
            code: 'unauthorized',
            message: 'not authorized to edit this field',
            step: 'validation',
          },
        ]);
      });
    });
  });
});
